# Contracts Directory

**Feature**: `003-bus-filter-page`  
**Purpose**: TypeScript interface definitions for the bus filter page feature

## Overview

This directory contains interface contracts for static bus data, runtime filter state, bus page component props, and viewport-based rendering helpers. These files define the expected shapes before production code is implemented.

## Files

### `bus-data.ts`

Interfaces for generated static bus route and stop datasets.

### `buses.schema.json`

JSON Schema contract for `public/data/buses.json`.

### `bus-stops.schema.json`

JSON Schema contract for `public/data/bus-stops.json`.

### `bus-filter-state.ts`

Interfaces for route selection, stop selection, and density-aware rendering state on the bus page.

### `component-props.ts`

React prop contracts for the bus page, route filter UI, stop detail UI, and map integration.

### `map-functions.ts`

Function signatures and constants for viewport filtering, stop rendering thresholds, and route lookup helpers.

## Usage Notes

- These contracts are planning artifacts, not implementation files.
- Production types should align with these interfaces or intentionally document any deviation.
- Build-time schema validation should be consistent with the shapes defined here.