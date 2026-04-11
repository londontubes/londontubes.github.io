const fs = require('fs');
const path = require('path');

const lineNames = {
  bakerloo: 'Bakerloo',
  central: 'Central',
  circle: 'Circle',
  district: 'District',
  elizabeth: 'Elizabeth line',
  'hammersmith-city': 'Hammersmith & City',
  jubilee: 'Jubilee',
  metropolitan: 'Metropolitan',
  northern: 'Northern',
  piccadilly: 'Piccadilly',
  victoria: 'Victoria',
  'waterloo-city': 'Waterloo & City'
};

function parseDurationMinutes(text) {
  const hourMatch = text.match(/(\d+)\s*hr/i);
  const minuteMatch = text.match(/(\d+)\s*min/i);
  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
  return hours * 60 + minutes;
}

function extractRouteBlocks(directionsText) {
  const rawText = String(directionsText || '')
    .replace(/\u202f/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const schedulePattern = /\d{1,2}:\d{2}\s*[AP]M(?:\s*\(Monday\))?\s*[–-]\s*\d{1,2}:\d{2}\s*[AP]M/gi;
  const durationPattern = /\d+\s*(?:hr(?:\s+\d+\s*min)?|min)/gi;
  const scheduleMatches = Array.from(rawText.matchAll(schedulePattern));
  const blocks = [];

  for (let index = 0; index < scheduleMatches.length; index += 1) {
    const scheduleMatch = scheduleMatches[index];
    const windowStart = Math.max(0, scheduleMatch.index - 48);
    const precedingText = rawText.slice(windowStart, scheduleMatch.index);
    const durationMatches = Array.from(precedingText.matchAll(durationPattern));
    const lastDuration = durationMatches.at(-1);
    const start = lastDuration ? windowStart + lastDuration.index : windowStart;
    const nextScheduleIndex = scheduleMatches[index + 1]?.index ?? rawText.length;
    const exploreIndex = rawText.indexOf(' Explore ', scheduleMatch.index);
    const endCandidates = [nextScheduleIndex, exploreIndex === -1 ? rawText.length : exploreIndex];
    const end = Math.min(...endCandidates.filter((value) => value > scheduleMatch.index));
    blocks.push(rawText.slice(start, end).trim());
  }

  return blocks;
}

function parseJourneyBlock(block, lineName) {
  if (!block || !block.toLowerCase().includes(lineName.toLowerCase())) {
    return null;
  }

  const scheduleMatch = block.match(/(\d{1,2}:\d{2}\s*[AP]M(?:\s*\(Monday\))?\s*[–-]\s*\d{1,2}:\d{2}\s*[AP]M)/i);
  const departureMatch = block.match(/(\d{1,2}:\d{2}\s*[AP]M\s+from\s+.*?)(?=£|Details|$)/i);
  const fareMatch = block.match(/(£\d+(?:\.\d{2})?)/);

  return {
    durationMinutes: parseDurationMinutes(block),
    schedule: scheduleMatch ? scheduleMatch[1].replace(/\s*[–-]\s*/, ' – ') : null,
    lineSummary: lineName,
    departureSummary: departureMatch ? departureMatch[1].trim() : null,
    fare: fareMatch ? fareMatch[1] : null,
    rawText: block
  };
}

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/google-maps/parse-captured-line.js <input-path> <output-path>');
  process.exit(1);
}

const rawCapture = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const lineCode = rawCapture.metadata.lineCode;
const lineName = lineNames[lineCode] || rawCapture.metadata.lineName || lineCode;
const unavailableStatus = `no-${lineCode}-option-found`;

const journeys = rawCapture.journeys.map((journey) => {
  const blocks = extractRouteBlocks(journey.directionsText);
  const matchedBlock = blocks.find((block) => block.toLowerCase().includes(lineName.toLowerCase()));
  const observedJourney = matchedBlock ? parseJourneyBlock(matchedBlock, lineName) : null;

  if (!observedJourney) {
    return {
      fromStationId: journey.fromStationId,
      fromDisplayName: journey.fromDisplayName,
      toStationId: journey.toStationId,
      toDisplayName: journey.toDisplayName,
      graphRunMinutes: journey.graphRunMinutes,
      routeUrl: journey.routeUrl,
      captureStatus: unavailableStatus,
      source: 'google-maps-bulk-capture',
      observedJourney: null,
      deltaFromGraphMinutes: null,
      notes: `Google Maps did not surface a ${lineName} option at Monday 8am for this direct pair.`
    };
  }

  return {
    fromStationId: journey.fromStationId,
    fromDisplayName: journey.fromDisplayName,
    toStationId: journey.toStationId,
    toDisplayName: journey.toDisplayName,
    graphRunMinutes: journey.graphRunMinutes,
    routeUrl: journey.routeUrl,
    captureStatus: `matched-${lineCode}`,
    source: 'google-maps-bulk-capture',
    observedJourney,
    deltaFromGraphMinutes: observedJourney.durationMinutes - journey.graphRunMinutes,
    notes: null
  };
});

const matchedPairs = journeys.filter((journey) => journey.captureStatus === `matched-${lineCode}`).length;
const unavailablePairs = journeys.length - matchedPairs;

const parsed = {
  metadata: {
    lineCode,
    source: 'Google Maps browser capture via MCP Playwright',
    requestedDeparture: {
      dayLabel: 'Monday',
      localDate: '2026-04-13',
      localTime: '08:00',
      timeZone: 'Europe/London',
      googleMapsTimestampParam: rawCapture.metadata.requestedDepartureTimestamp || '1776067200'
    },
    scope: `Direct adjacent ${lineName} line station pairs derived from static graph edges`,
    totalPairs: journeys.length,
    matchedPairs,
    unavailablePairs,
    generatedAt: new Date().toISOString(),
    notes: [
      `This file stores Monday 8am Google Maps reference times for direct ${lineName} line station pairs so future work does not need to re-query Google Maps.`,
      `Pairs with no ${lineName} option remain in the dataset with captureStatus set to ${unavailableStatus}.`,
      'These values are kept separate from public/data/static-tube-times.json, which remains the app internal graph dataset.'
    ]
  },
  journeys
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');