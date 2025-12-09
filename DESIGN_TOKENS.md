# Design Tokens from Figma

This document outlines the design tokens that need to be extracted from your Figma design and updated in the Tailwind configuration.

## 📐 How to Extract Design Tokens from Figma

1. Open your Figma design file
2. Select any element to see its properties
3. Extract the following values:

## 🎨 Colors

Update `client/tailwind.config.js` → `theme.extend.colors` with exact values from Figma:

- **Primary Colors**: Extract from buttons, links, and primary UI elements
- **Secondary Colors**: Extract from secondary buttons and accents
- **Accent Colors**: Extract from highlights and call-to-action elements
- **Neutral Colors**: Extract from text, borders, and backgrounds
- **Success/Error/Warning**: Extract from status indicators

## 📝 Typography

Update `client/tailwind.config.js` → `theme.extend.fontFamily` and `fontSize`:

- **Font Families**: 
  - Primary font (body text)
  - Display font (headings)
- **Font Sizes**: Extract all text styles (xs, sm, base, lg, xl, 2xl, etc.)
- **Line Heights**: Extract line-height values for each font size
- **Font Weights**: Extract weight values (300, 400, 500, 600, 700, 800)

## 📏 Spacing

Update `client/tailwind.config.js` → `theme.extend.spacing`:

- Extract spacing scale (4px, 8px, 12px, 16px, 24px, 32px, etc.)
- Match exact padding and margin values from Figma

## 🔲 Border Radius

Update `client/tailwind.config.js` → `theme.extend.borderRadius`:

- Extract border radius values for:
  - Buttons
  - Cards
  - Inputs
  - Modals

## 🌑 Shadows

Update `client/tailwind.config.js` → `theme.extend.boxShadow`:

- Extract shadow values for:
  - Cards
  - Buttons (hover states)
  - Modals
  - Dropdowns

## 📱 Breakpoints

Update `client/tailwind.config.js` → `theme.extend.screens` (if custom breakpoints are needed):

- Mobile: Usually 640px (sm)
- Tablet: Usually 768px (md)
- Desktop: Usually 1024px (lg)
- Large Desktop: Usually 1280px (xl)

## 🔄 Quick Update Steps

1. Open Figma design
2. Select a primary button → Copy color value → Update `primary.600` in Tailwind config
3. Select heading text → Copy font family, size, weight → Update typography
4. Select a card → Copy border-radius, shadow → Update borderRadius and boxShadow
5. Repeat for all design elements

## ✅ Verification

After updating tokens:

1. Run `npm run dev` in the client directory
2. Compare UI with Figma design side-by-side
3. Adjust values until pixel-perfect match
4. Test on mobile, tablet, and desktop breakpoints

---

**Note**: The current Tailwind config uses sensible defaults. Replace them with exact Figma values for pixel-perfect implementation.

