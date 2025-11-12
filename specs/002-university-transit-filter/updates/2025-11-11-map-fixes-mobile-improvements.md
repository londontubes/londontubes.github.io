# Update: Map Rendering Fixes and Mobile UX Improvements

**Date**: 2025-11-11  
**Branch**: main  
**Commit**: eb38095

## Summary

This update addresses critical map rendering issues with MultiLineString geometries and improves the mobile user experience across both Line Filter and Universities pages.

## Changes Implemented

### 1. Fixed Piccadilly Line Rendering Issue

**Problem**: The Piccadilly line displayed an incorrect straight blue line connecting Cockfosters to other branch endpoints, creating a false connection between separate branches.

**Root Cause**: The code was using `.flat()` to merge all MultiLineString segments into a single array, which created direct connections between the last point of one segment and the first point of the next segment.

**Solution**: Modified `LeafletMapCanvas.tsx` to render each MultiLineString segment as a separate `<Polyline>` component:

```typescript
// Before: Flattened all segments into one array
const coords = line.polyline.type === 'MultiLineString'
  ? (line.polyline.coordinates as [number, number][][]).flat()
  : (line.polyline.coordinates as [number, number][])

// After: Process each segment separately
if (line.polyline.type === 'MultiLineString') {
  const segments = line.polyline.coordinates as [number, number][][]
  segments.forEach((segment, index) => {
    result.push({
      lineCode: line.lineCode,
      displayName: line.displayName,
      brandColor: line.brandColor,
      positions: segment.map(([lng, lat]) => [lat, lng] as [number, number]),
      segmentIndex: index,
    })
  })
}
```

**Impact**: 
- Correctly renders branching structure of Piccadilly line and other MultiLineString lines
- Eliminates false visual connections between separate branches
- Maintains proper geographic representation of the tube network

**Files Changed**:
- `app/components/MapCanvas/LeafletMapCanvas.tsx`

---

### 2. Mobile View Improvements

#### 2.1 Line Filter Page (Homepage)

**Changes**:
- **Show tube filter buttons above map**: Reversed previous decision to hide filters on mobile; buttons now appear above the map using `order: -1` and `flex` layout
- **Hide header**: Removed "London Tube & DLR Network" title and stats ("310 stations · 12 lines · All lines") on mobile to save vertical space

**CSS Rules Added** (`globals.css`):
```css
@media (max-width: 640px) {
  /* Hide header in line filter page on mobile */
  .map-experience__header-inline {
    display: none;
  }
  
  /* Show line filter above map on mobile for main page */
  .line-filter {
    display: flex;
    order: -1;
    margin-bottom: 0.75rem;
  }
}
```

#### 2.2 Universities Filter Page

**Changes**:
- **Hide tube line filter on mobile**: The tube line filter buttons are hidden on mobile view for the universities page, as university selection drives the filtering logic rather than manual line selection

**Implementation**:
- Added `university-experience` class to `UniversityExperience` component wrapper
- Added CSS rule to hide `.line-filter` specifically within `.university-experience` on mobile

**CSS Rules Added** (`globals.css`):
```css
@media (max-width: 640px) {
  /* Hide line filter on mobile in university experience */
  .university-experience .line-filter {
    display: none !important;
  }
}
```

**Files Changed**:
- `app/components/UniversityExperience/UniversityExperience.tsx`
- `app/globals.css`

---

## Design Rationale

### Mobile-First Considerations

1. **Vertical Space**: Mobile screens have limited vertical space, so we prioritize the map and essential controls
2. **Touch Targets**: Tube filter buttons remain accessible on mobile with appropriate sizing (44px height, 32px touch targets)
3. **Progressive Disclosure**: Headers and secondary information hidden on mobile to focus on core functionality
4. **Context-Specific UI**: Different mobile layouts for Line Filter (manual selection) vs Universities (automatic selection) pages

### User Experience Impact

- **Line Filter Mobile**: Users can now filter lines directly on mobile without hiding controls, making the primary feature accessible
- **Universities Mobile**: Cleaner interface focuses on university selection and map view, with proximity-based filtering happening automatically
- **Reduced Cognitive Load**: Fewer UI elements on mobile reduces visual clutter and improves focus

---

## Testing Notes

**Tested Scenarios**:
1. ✅ Piccadilly line renders correctly with separate branches (no false connections)
2. ✅ Line filter buttons visible and functional on mobile (Line Filter page)
3. ✅ Header hidden on mobile (Line Filter page)
4. ✅ Tube line filter hidden on mobile (Universities page)
5. ✅ Desktop views remain unchanged (all features visible)
6. ✅ Other MultiLineString lines (if any) render correctly

**Browser Compatibility**:
- Tested on mobile viewport (≤640px width)
- CSS media queries properly scoped
- No JavaScript changes required for mobile views (pure CSS solution)

---

## Technical Details

### MultiLineString Segment Rendering

Each segment now receives a unique key combining line code and segment index:
```typescript
key={`${line.lineCode}-${line.segmentIndex}`}
```

This ensures React can properly track and update individual segments without re-rendering the entire line.

### Mobile Breakpoint

Using `640px` as the mobile breakpoint (standard Tailwind `sm` breakpoint):
- Below 640px: Mobile-optimized layout
- Above 640px: Full desktop layout with all elements visible

### Specificity Management

Used `!important` sparingly and only where necessary to override default flex display behavior within the `.university-experience` context.

---

## Future Considerations

1. **Tablet Layout**: Could add intermediate breakpoint (768px-1024px) for tablet-specific optimizations
2. **Landscape Mobile**: Consider separate rules for landscape orientation on mobile devices
3. **Filter Toggle**: Could add a collapse/expand button for line filters on mobile instead of hiding entirely
4. **Accessibility**: Ensure screen reader announcements remain clear when elements are hidden via CSS

---

## Related Issues

- Fixed Piccadilly line straight line issue (reported by user)
- Improved mobile UX based on user feedback
- Maintained consistency between Line Filter and Universities pages where appropriate

