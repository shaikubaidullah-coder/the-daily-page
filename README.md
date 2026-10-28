# The Daily Page — Interactive Digital Journal

A faithfully crafted recreation of the vintage illustrated digital scrapbook experience from [The Daily Page](https://the-daily-page.replit.app/).

## Features

- **Atmospheric Scrapbook Scene**: Authentic warm fur/wood background with soft light bokeh overlay, vintage floral lace borders, antique clipboard clip, and ribbon bookmark.
- **Physical Journal Illusion**: Centered two-page spread with ivory textured paper, subtle dot grid, center spine shadow, and realistic rounded corners.
- **3D Physics-Based Page Turn**: Smooth 3D page curl physics with dynamic cast shadows and realistic paper illumination gradients.
- **Ink-Writing Animation**: Custom SVG filter and randomized letter-by-letter ink diffusion effect simulating wet fountain ink absorbing into raw paper.
- **71 Curated Prompts across 7 Categories**:
  - `Becoming`
  - `Seasons`
  - `Connection`
  - `Little Things`
  - `Living`
  - `Remembrance`
  - `Reflections`
- **Interactive Collages & Hover Artwork**: Interactive botanical sprigs, dried flowers, framed portraits, and locket miniatures with micro-animations.
- **Responsive Camera System**:
  - Desktop: Center-locked high-fidelity two-page spread with circular chevron arrow controls.
  - Mobile: Panning camera sliding between "Cover" and "Today's Page", touch swipe detection, and mobile arrow buttons.
- **Keyboard & Touch Controls**: Full keyboard navigation (Left/Right arrows) and click/tap to turn pages.

---

## How to Customize With Your Own Assets

All artwork and content are cleanly separated from the layout engine:

### 1. Replace Images & Photos
- **Central Left Page Collages**: Add your images to `public/assets/` and update references in `src/data/spreads.ts` under `BASE_SPREADS`.
  - Vintage frame backing: `public/assets/wood.png` or your own textured background.
  - Frame ornament: `public/assets/frame-trim.png`.
  - Photo / Portrait: `public/assets/photo.png`.
  - Additional spread collages: `spread-02-left.png` through `spread-08-left.png`.
- **Botanical Ephemera**:
  - Dried flowers: `public/assets/flowers-top-right.png`.
  - Green botanical sprig: `public/assets/sprig-raw-2.png`.

### 2. Add or Edit Reflective Prompts
Edit `src/data/spreads.ts`:
```ts
export const PROMPT_CATEGORIES = [
  {
    category: "My Custom Category",
    prompts: [
      "What moment made you feel at peace today?",
      "Who are you grateful for right now?"
    ]
  },
  ...
];
```

### 3. Change Attribution in Footer
In `src/App.tsx`, update the `<footer className="colophon">` section with your own name, links, or copyright.

---

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
