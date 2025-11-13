# London-tube Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-07

## Active Technologies
- N/A (static data files bundled at build time) (001-map-line-filter)
- TypeScript 5.x with Next.js static expor + Next.js App Router, React 19, `@googlemaps/js-api-loader`, Transport for London Unified API GeoJSON exports for lines and stations, university location dataset (JSON) (002-university-transit-filter)
- N/A (static data files bundled at build time - reuses existing lines.json, stations.json; adds universities.json) (002-university-transit-filter)

- TypeScript 5.x with Next.js static expor + Next.js App Router, React 19, `@googlemaps/js-api-loader`, Transport for London Unified API GeoJSON exports for lines and stations (001-map-line-filter)

## Project Structure

```text
src/
tests/
```

## Commands

npm run lint

## Code Style

TypeScript 5.x with Next.js static expor: Follow standard conventions

## Recent Changes
- 002-university-transit-filter: Added TypeScript 5.x with Next.js static expor + Next.js App Router, React 19, `@googlemaps/js-api-loader`, Transport for London Unified API GeoJSON exports for lines and stations, university location dataset (JSON)
- 001-map-line-filter: Added TypeScript 5.x with Next.js static expor + Next.js App Router, React 19, `@googlemaps/js-api-loader`, Transport for London Unified API GeoJSON exports for lines and stations

<!-- MANUAL ADDITIONS START -->
## Merge-to-Main Checklist

Before merging any feature branch into `main`, always run linting and type checks locally to prevent broken builds:

1. Update branch: `git fetch origin && git rebase origin/main` (or merge) to ensure up-to-date base.
2. Run lint & type check: `npm run lint` (or `npm run build` if it triggers type checking).
3. Fix all issues BEFORE merging. Do not ignore warnings that will surface as errors during type checking.
	- Resolve unused variables (e.g., `targetName` assigned but never used).
	- Remove or refactor conditional React hook calls (hooks must be top-level, not inside conditionals or early returns).
	- Replace `any` types with specific interfaces or generics.
	- Verify all imports exist (e.g., ensure functions like `calculateTravelTimes` are correctly exported from `travelTime.ts` or update import paths).
4. Confirm successful compile: no "Failed to compile" and no lingering warnings converting to errors.
5. Only then proceed: `git checkout main`, `git merge <feature-branch> --no-ff`, `git push origin main`.
6. If errors appear after merge (CI or local), revert or hotfix immediately rather than leaving main in a broken state.

Purpose: Prevent merge scenarios where the build progresses through a warning phase, then fails type-check (example: attempted import error + unused vars + conditional hook violations + unexpected `any`). This keeps `main` always deployable.

Short Command Sequence:
```
git fetch origin
git rebase origin/main   # while on feature branch
npm run lint              # fix all issues
git commit -am "chore: fix lint prior to merge"
git checkout main
git merge <feature-branch> --no-ff
git push origin main
```
<!-- MANUAL ADDITIONS END -->
