# London Tube Map - Interactive Line Filter

A modern, accessible static web application for exploring the London Underground and DLR network with interactive line filtering.

## Features

- Interactive Google Maps-based visualization
- Filter by individual or multiple tube/DLR lines
- Accessible keyboard navigation
- Mobile-responsive design
- Static site generation for fast loading

## Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- Google Maps JavaScript API key

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env.local` file:

```
GOOGLE_MAPS_API_KEY=your-api-key-here
TFL_APP_ID=your-tfl-app-id (optional)
TFL_APP_KEY=your-tfl-app-key (optional)
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Building for Production

```bash
npm run build
npm run start:static
```

### Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Accessibility audit
npm run audit:accessibility
```

### Data Refresh

```bash
npm run data:refresh
```

## Project Structure

- `app/` - Next.js App Router pages and components
- `public/data/` - Static GeoJSON data files
- `scripts/` - Data fetching and transformation scripts
- `tests/` - E2E and accessibility tests

## License

MIT
