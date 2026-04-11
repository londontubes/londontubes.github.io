import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const linesPath = path.join(rootDir, 'public', 'data', 'lines.json');
const stationsPath = path.join(rootDir, 'public', 'data', 'stations.json');
const FALLBACK_LINE_SPEED_MPH = 22;
const FALLBACK_DWELL_MINUTES = 0.5;

const queryOverrides = {
  'Bank': 'Bank Station, London',
  'Barking': 'Barking Station, London',
  'Blackfriars': 'Blackfriars Station, London',
  'Bond Street': 'Bond Street Station, London',
  'Canary Wharf': 'Canary Wharf Station, London',
  'Cannon Street': 'Cannon Street Station, London',
  'Charing Cross': 'Charing Cross Station, London',
  'Ealing Broadway': 'Ealing Broadway Station, London',
  'Edgware Road (Circle Line) Underground Station': 'Edgware Road Station, London',
  'Euston': 'Euston Station, London',
  'Farringdon': 'Farringdon Station, London',
  'Finchley Road': 'Finchley Road Station, London',
  'Finsbury Park': 'Finsbury Park Station, London',
  'Gloucester Road Underground Station': 'Gloucester Road Station, London',
  'Goldhawk Road Underground Station': 'Goldhawk Road Station, London',
  'Gunnersbury': 'Gunnersbury Station, London',
  'Hammersmith': 'Hammersmith Station, London',
  'Harrow-on-the-Hill': 'Harrow-on-the-Hill Station, London',
  'Highbury & Islington': 'Highbury & Islington Station, London',
  'Kensington (Olympia)': 'Kensington Olympia Station, London',
  'Kew Gardens': 'Kew Gardens Station, London',
  "King's Cross & St Pancras International": 'St Pancras International, London',
  'Liverpool Street': 'Liverpool Street Station, London',
  'London Bridge': 'London Bridge Station, London',
  'Maida Vale Underground Station': 'Maida Vale Station, London',
  'Mansion House Underground Station': 'Mansion House Station, London',
  'Marylebone': 'Marylebone Station, London',
  'Monument Underground Station': 'Monument Station, London',
  'Moorgate': 'Moorgate Station, London',
  'Notting Hill Gate Underground Station': 'Notting Hill Gate Station, London',
  'Oxford Circus Underground Station': 'Oxford Circus Station, London',
  'Paddington': 'Paddington Station, London',
  'Regent\'s Park Underground Station': 'Regent\'s Park Station, London',
  'Richmond': 'Richmond Station, London',
  'Shepherd\'s Bush (Central) Underground Station': 'Shepherd\'s Bush Station, London',
  'Sloane Square Underground Station': 'Sloane Square Station, London',
  'South Kensington Underground Station': 'South Kensington Station, London',
  'Stratford': 'Stratford Station, London',
  'Temple Underground Station': 'Temple Station, London',
  'Tottenham Court Road': 'Tottenham Court Road Station, London',
  'Tower Hill Underground Station': 'Tower Hill Station, London',
  'Vauxhall': 'Vauxhall Station, London',
  'Victoria': 'Victoria Station, London',
  'Walthamstow Central': 'Walthamstow Central Station, London',
  'Waterloo': 'Waterloo Station, London',
  'West Brompton': 'West Brompton Station, London',
  'West Ham': 'West Ham Station, London',
  'Westminster': 'Westminster Station, London',
  'Whitechapel': 'Whitechapel Station, London',
  'Wimbledon': 'Wimbledon Station, London'
};

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function estimateRunMinutes(fromStation, toStation) {
  const [fromLng, fromLat] = fromStation.coordinates;
  const [toLng, toLat] = toStation.coordinates;
  const distMeters = haversineMeters(fromLat, fromLng, toLat, toLng);
  const distMiles = distMeters / 1609.34;
  return Math.round((((distMiles / FALLBACK_LINE_SPEED_MPH) * 60) + FALLBACK_DWELL_MINUTES) * 10) / 10;
}

function buildStationLookup(stations) {
  return new Map(
    stations.map((station) => [
      station.stationId,
      {
        stationId: station.stationId,
        displayName: station.displayName,
        query: queryOverrides[station.displayName] || station.displayName,
        coordinates: station.position.coordinates,
      },
    ])
  );
}

function buildLineManifestJourneys(line, stationLookup) {
  const journeys = [];
  const seen = new Set();

  const addJourney = (fromStationId, toStationId) => {
    const dedupeKey = `${fromStationId}->${toStationId}`;
    if (seen.has(dedupeKey)) {
      return;
    }

    const fromStation = stationLookup.get(fromStationId);
    const toStation = stationLookup.get(toStationId);

    if (!fromStation || !toStation) {
      throw new Error(`Missing station metadata for edge ${fromStationId} -> ${toStationId}`);
    }

    seen.add(dedupeKey);
    journeys.push({
      fromStationId,
      fromDisplayName: fromStation.displayName,
      fromQuery: fromStation.query,
      toStationId,
      toDisplayName: toStation.displayName,
      toQuery: toStation.query,
      graphRunMinutes: estimateRunMinutes(fromStation, toStation),
    });
  };

  for (let index = 0; index < line.stationIds.length - 1; index += 1) {
    const fromStationId = line.stationIds[index];
    const toStationId = line.stationIds[index + 1];
    if (!fromStationId || !toStationId || fromStationId === toStationId) {
      continue;
    }
    addJourney(fromStationId, toStationId);
    addJourney(toStationId, fromStationId);
  }

  return journeys.sort((left, right) => {
    const leftKey = `${left.fromDisplayName} ${left.toDisplayName}`;
    const rightKey = `${right.fromDisplayName} ${right.toDisplayName}`;
    return leftKey.localeCompare(rightKey);
  });
}

function usage() {
  console.error('Usage: node scripts/google-maps/build-line-manifest.js <line-code> [output-path]');
  process.exit(1);
}

const [, , lineCode, outputPath] = process.argv;

if (!lineCode) {
  usage();
}

const lines = loadJson(linesPath);
const stations = loadJson(stationsPath);
const stationLookup = buildStationLookup(stations.stations || []);
const line = (lines.lines || []).find((candidate) => candidate.lineCode === lineCode);

if (!line) {
  throw new Error(`Unknown line code: ${lineCode}`);
}

const journeys = buildLineManifestJourneys(line, stationLookup);

const manifest = {
  lineCode,
  totalPairs: journeys.length,
  generatedAt: new Date().toISOString(),
  journeys,
};

const output = `${JSON.stringify(manifest, null, 2)}\n`;

if (outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output, 'utf8');
} else {
  process.stdout.write(output);
}