async (page) => {
  const manifest = {"lineCode":"bakerloo","totalPairs":1,"generatedAt":"2026-04-10T22:07:01.200Z","journeys":[{"fromStationId":"HUBWAT","fromDisplayName":"Waterloo","fromQuery":"Waterloo Station, London","toStationId":"940GZZLUEMB","toDisplayName":"Embankment Underground Station","toQuery":"Embankment Underground Station","graphRunMinutes":1}]};
  const lineName = "Bakerloo";
  const requestedTimestamp = '1776067200';
  const lineCode = manifest.lineCode;

  const delay = (ms) => page.waitForTimeout(ms);

  const extractDirectionsText = async () => {
    return page.evaluate(() => {
      const directions = document.querySelector('main[aria-label="Directions"]');
      return (directions?.innerText || document.body.innerText || '')
        .replace(/\u202f/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    });
  };

  const ensureConsentDismissed = async () => {
    const reject = page.getByRole('button', { name: /Reject all/i });
    if (await reject.count()) {
      await reject.first().click();
      await delay(1000);
      return;
    }

    const accept = page.getByRole('button', { name: /Accept all/i });
    if (await accept.count()) {
      await accept.first().click();
      await delay(1000);
    }
  };

  const switchToTransitMode = async () => {
    const publicTransportRadio = page.getByRole('radio', { name: /Public transport/i });
    if (await publicTransportRadio.count()) {
      const checked = await publicTransportRadio.first().getAttribute('aria-checked');
      if (checked !== 'true') {
        await publicTransportRadio.first().click();
        await delay(1000);
      }
    }
  };

  const setMondayDeparture = async () => {
    const timeButton = page.getByRole('button', { name: /Leave now|Depart at/i });
    if (await timeButton.count()) {
      await timeButton.first().click();
      await delay(500);
      const departAt = page.getByRole('menuitemradio', { name: /Depart at/i }).or(page.getByText(/^Depart at$/));
      if (await departAt.count()) {
        await departAt.first().click();
      }
      await delay(1000);
    }

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const currentUrl = page.url();
      const timestampMatch = currentUrl.match(/8j(\d+)/);
      if (timestampMatch) {
        if (timestampMatch[1] !== requestedTimestamp) {
          const forcedUrl = currentUrl.replace(/8j\d+/, '8j' + requestedTimestamp);
          await page.goto(forcedUrl, { waitUntil: 'domcontentloaded' });
          await delay(1500);
        }
        return page.url();
      }
      await delay(500);
    }

    return page.url();
  };

  const waitForResolvedDirectionsUrl = async (initialUrl) => {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const currentUrl = page.url();
      if (currentUrl !== initialUrl && /!1m\d/.test(currentUrl)) {
        return currentUrl;
      }
      await delay(500);
    }
    return page.url();
  };

  await page.setViewportSize({ width: 1440, height: 1200 });

  const journeys = [];

  for (const journey of manifest.journeys) {
    const routeUrl = 'https://www.google.com/maps/dir/' + encodeURIComponent(journey.fromQuery) + '/' + encodeURIComponent(journey.toQuery) + '/data=!4m2!4m1!3e3?entry=ttu';
    await page.goto(routeUrl, { waitUntil: 'domcontentloaded' });
    await ensureConsentDismissed();
    await switchToTransitMode();
    await waitForResolvedDirectionsUrl(routeUrl);
    const finalUrl = await setMondayDeparture();
    await page.waitForLoadState('domcontentloaded');
    await delay(1500);

    journeys.push({
      ...journey,
      routeUrl: finalUrl,
      source: 'google-maps-bulk-capture',
      directionsText: await extractDirectionsText()
    });
  }

  return {
    metadata: {
      lineCode,
      lineName,
      requestedDepartureTimestamp: requestedTimestamp,
      generatedAt: new Date().toISOString(),
      totalPairs: journeys.length,
      source: 'Google Maps browser capture via MCP Playwright'
    },
    journeys
  };
}