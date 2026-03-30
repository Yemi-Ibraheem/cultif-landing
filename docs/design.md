# Cultif Design System

Single source of truth for visual patterns, tokens, and reusable component styles. Reference this before writing any new CSS or component.

---

## 1. Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--brand-primary` | `#20b2aa` | Buttons, active states, labels, borders, sliders, toggles |
| `--brand-primary-hover` | `#1a9e97` | Hover state for primary buttons |
| `--brand-primary-bg` | `rgba(32, 178, 170, 0.1)` | Selected chip background, tag background |
| `--nav-bg` | `#1CC8EA` | Bottom navigation bar background |
| `--nav-active` | `#004d40` | Active nav icon color |
| `--text-primary` | `#333` | Body text, headings |
| `--text-secondary` | `#666` | Descriptions, subtitles |
| `--text-muted` | `#999` | Labels, metadata |
| `--text-link` | `#20b2aa` | Clickable section links, "View all" |
| `--border-default` | `#e0e0e0` (1.5px) | Input borders, chip borders, stepper borders |
| `--border-subtle` | `#f0f0f0` or `#f5f5f5` | Dividers between rows/subsections |
| `--surface-page` | `#f5f5f5` | Page background |
| `--surface-card` | `#ffffff` | Card / section backgrounds |
| `--surface-row` | `#f9f9f9` | Row-level backgrounds (e.g. ingredient rows) |
| `--danger` | `#e53e3e` | Delete actions, error states |
| `--notification-dot` | `#ff3b30` | Notification badge |

---

## 2. Typography

Font stack: `system-ui, Avenir, Helvetica, Arial, sans-serif` (set in `src/index.css`)

| Role | Size | Weight | Color |
|---|---|---|---|
| Card title (H2) | `1.5rem` | `700` | `#333` |
| Recipe title | `1.5rem` | `700` | `#333` |
| Section label (caps) | `0.8rem` | `700` | `#20b2aa` (uppercase, letter-spacing 0.6px) |
| Settings page title | `1.25rem` | `700` | `#1a1a1a` |
| Subsection title | `0.9rem` | `600` | `#333` |
| Row label | `0.9rem` | `500` | `#333` |
| Row sublabel / hint | `0.78rem` | `400` | `#999` |
| Chip / tag text | `0.82rem` | `500` | `#555` |
| Chip selected text | `0.82rem` | `600` | `#20b2aa` |
| Country chip text | `0.8rem` | `500` | `#555` |
| Meta / caption | `0.85rem` | `500` | `#444` or `#666` |
| Profile label (caps) | `0.75rem` | `600` | `#999` (uppercase, letter-spacing 0.3px) |
| Chef overlay name | `0.8rem` | `600` | `#fff` |

---

## 3. Spacing & Layout

- **Page padding-bottom**: `80px` — reserves space above the fixed bottom nav
- **Content padding**: `0.75rem` or `1rem` on pages
- **Card padding**: `1rem` inside `.settings-section`
- **Section gap**: `0.75rem` between sections
- **Chip gap**: `0.5rem` between chips in a row
- **Row min-height**: `48px` for tappable rows

---

## 4. Border Radius Reference

| Element | Radius |
|---|---|
| Bottom nav bar | `20px 20px 0 0` |
| Recipe image container | `20px` |
| Section card | `14px` |
| Modal / confirmation | `16px` |
| Chips / pills | `20px` |
| Buttons (primary CTA) | `25px` |
| Buttons (inline save/cancel) | `6px` |
| Action buttons (paired) | `12px` |
| Inputs / selects | `8px` |
| Stepper | `8px` |
| Chef overlay pill | `20px` |
| Avatar | `50%` |
| Flag images in chips | `2px` |

---

## 5. Dietary Icon Pattern

Dietary SVGs in `src/assets/Dietaryicons/` contain the icon graphic AND baked-in text in the lower portion of the viewBox. Always crop the text by wrapping with a fixed-size overflow-hidden container.

### Available Icons
| Label | File |
|---|---|
| Halal | `Halal (1).svg` |
| Vegan | `Vegan.svg` |
| Vegetarian | `Vegetarian.svg` |
| Protein | `Protein.svg` |
| Weight gain | `Weight gain.svg` |
| Bulk | `Bulk.svg` |
| Fatty | `Fatty.svg` |

### CSS — Icon Crop Wrapper
```css
/* Wrapper crops out the built-in SVG text.
   The icon occupies the top ~24px of a ~41px viewBox.
   Rendering the <img> at 36px wide pushes text below the 20px clip. */
.chip-icon-wrap {
  width: 20px;
  height: 20px;
  overflow: hidden;
  flex-shrink: 0;
  display: block;
}

.chip-icon {
  width: 36px;
  height: auto;
  display: block;
  margin-left: -8px;
}
```

### Usage in a chip
```tsx
<span className="chip-icon-wrap">
  <img src={halalIcon} alt="" className="chip-icon" />
</span>
<span>Halal</span>
```

### Size override — optically large icons
Some icons (e.g. Protein.svg) have more internal whitespace and appear smaller at the standard 50px. Apply the `--large` modifier:
```css
/* Standard */
.box-diet-icon { width: 50px; height: 50px; object-fit: contain; }

/* Override for icons with extra internal padding */
.box-diet-icon--large { width: 58px; height: 58px; }
```

**Rule**: Never use the SVG's built-in text to label a dietary tag. Always pair the icon with a separate HTML text element.

---

## 6. Country Flag Pattern

Flags live in `src/assets/flags/Mini flags/`. File names match country names (e.g. `Nigeria.svg`, `America.svg`).

### Available Flags
`Ghana`, `China`, `Morroco`, `France`, `Nigeria`, `Malaysia`, `Senegal`, `Spain`, `Germany`, `Colombia`, `Brazil`, `America`, `England`, `Ivory coast`, `Italy`, `Jamaica`, `Japan`, `Mexico`, `Argentina`

### FeaturedRecipeCard — flag in header
```css
.country-flag-icon {
  width: 20px;
  height: auto;
  object-fit: contain;
}
```

### Chip flag (ProfileSettings / RecipeDetail)
```css
.settings-chip-flag-img {
  width: 24px;
  height: 18px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 2px;
  display: block;
}
```

### RecipeDetail — chip flag
```css
.recipe-country-chip-flag {
  width: 18px;
  height: 13px;
  border-radius: 2px;
  object-fit: cover;
  flex-shrink: 0;
}
```

**Rule**: Always show the flag SVG. Never use a country abbreviation (e.g. "NG") as a substitute.

---

## 7. Chip / Pill Component

Used in ProfileSettings (dietary + country selections) and RecipeDetail (tag display).

### Base chip
```css
.settings-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  font-size: 0.82rem;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
}

.settings-chip:hover {
  border-color: #ccc;
  background: #fafafa;
}

.settings-chip.selected {
  background: rgba(32, 178, 170, 0.1);
  border-color: #20b2aa;
  color: #20b2aa;
  font-weight: 600;
}
```

### Country chip modifier (slightly smaller)
```css
.settings-chip-country {
  padding: 0.35rem 0.7rem;
  font-size: 0.8rem;
}
```

### Chip container
```css
.settings-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* For long lists (e.g. country selector) */
.settings-chips-scroll {
  max-height: 220px;
  overflow-y: auto;
}
```

### RecipeDetail — read-only chip (same visual, no cursor/hover)
```css
.recipe-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  font-size: 0.82rem;
  font-weight: 500;
  color: #555;
}

.recipe-chip.selected {
  background: rgba(32, 178, 170, 0.1);
  border-color: #20b2aa;
  color: #20b2aa;
  font-weight: 600;
}
```

---

## 8. Section Card (Settings / Detail pages)

```css
.settings-section {
  background: white;
  border-radius: 14px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.settings-section-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #20b2aa;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin: 0;
}
```

---

## 9. Row Item (List rows inside cards)

```css
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  min-height: 48px;
}

.settings-row + .settings-row {
  border-top: 1px solid #f5f5f5;
}
```

---

## 10. Toggle Switch

```css
.settings-toggle { width: 46px; height: 26px; }
/* Track: #ddd (off) → #20b2aa (on) */
/* Knob: white circle, 20×20px, translates 20px right when checked */
```

---

## 11. FeaturedRecipeCard Layout

Three-zone vertical layout for the home feed recipe card.

```
┌────────────────────────────────┐
│  HEADER: Title (left) / Flag+Country (right)  │
├────────────────────────────────┤
│  IMAGE (376px tall, border-radius: 20px)       │
│  └─ Chef overlay pill (top-left, absolute)     │
├────────────────────────────────┤
│  FOOTER (66px): Diet icons (left) / Rating (right) │
└────────────────────────────────┘
```

Key classes:
- `.featured-recipe-box` — outer container, `border-radius: 2px`, `overflow: hidden`
- `.box-header` — flex row, `justify-content: space-between`
- `.box-image-container` — `height: 376px`, `border-radius: 20px`
- `.box-chef-overlay` — `position: absolute; top: 10px; left: 10px`, dark pill
- `.box-chef-overlay-avatar` — `28×28px`, `border-radius: 50%`, `border: 1.5px solid #fff`
- `.box-footer` — `height: 66px`, flex row
- `.box-diet-icon` — `50×50px`, `object-fit: contain`
- `.box-diet-icon--large` — `58×58px` (for visually smaller icons)
- `.box-rating` — `font-size: 1.35rem`

---

## 12. Bottom Navigation Bar

```css
.bottom-navigation {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: #1CC8EA;
  border-radius: 20px 20px 0 0;
  padding: 10px 0 16px;
  z-index: 100;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.12);
}
```

Icons use CSS mask technique (white by default, `#004d40` + scale(1.15) when active).

```css
.nav-icon {
  width: 38px; height: 41px;
  background-color: white;
  -webkit-mask-size: contain;
  mask-repeat: no-repeat;
}
.nav-item.active .nav-icon {
  background-color: #004d40;
  transform: scale(1.15);
  filter: drop-shadow(0 0 8px rgba(255,255,255,0.9));
}
```

Notification dot: `9×9px`, `#ff3b30`, `border: 2px solid #1CC8EA` (matches nav bg).

---

## 13. Buttons

### Primary CTA
```css
background: #20b2aa;
color: white;
border: none;
border-radius: 25px;
padding: 0.75rem 2rem;
font-size: 1rem;
font-weight: 600;
```
Hover: `background: #1a9e97`

### Outlined Action Button (paired)
```css
border: 2px solid #20b2aa;
border-radius: 12px;
background: white;
color: #20b2aa;
padding: 0.75rem;
font-weight: 600;
```

### Inline Save / Cancel
```css
/* Save */
background: #20b2aa; color: white; border-radius: 6px;
padding: 0.35rem 0.85rem; font-size: 0.8rem; font-weight: 600;

/* Cancel */
background: #f0f0f0; color: #666; border-radius: 6px;
padding: 0.35rem 0.85rem; font-size: 0.8rem; font-weight: 600;
```

---

## 14. Inputs & Form Controls

```css
/* Text input */
border: 1.5px solid #e0e0e0;
border-radius: 8px;
padding: 0.45rem 0.65rem;
font-size: 0.9rem;
color: #333;
outline: none;
/* focus: border-color: #20b2aa */

/* Select */
max-width: 140px;
padding: 0.35rem 0.5rem;
border-radius: 8px;
```

---

## 15. Modals / Overlays

### Backdrop
```css
position: fixed; inset: 0;
background: rgba(0,0,0,0.45);
z-index: 1000;
display: flex; align-items: center; justify-content: center;
animation: fadeIn 0.2s ease;
```

### Bottom-sheet variant (Explore popup)
```css
align-items: flex-end;
/* card: */
border-radius: 16px 16px 0 0;
animation: slideUp 0.25s ease;
```

### Confirmation modal
```css
background: white;
border-radius: 16px;
padding: 1.5rem;
max-width: 360px;
animation: scaleIn 0.25s ease;
```

---

## 16. Avatar Pattern

Avatars may be HTTP URLs or Convex storage IDs. Always resolve via `getStorageUrl` before rendering.

```tsx
const avatarRaw = user?.avatar || user?.image || '';
const isAvatarStorageId = avatarRaw
  && !avatarRaw.startsWith('http')
  && !avatarRaw.startsWith('/')
  && !avatarRaw.startsWith('data:')
  && avatarRaw !== 'placeholder';

const avatarStorageUrl = useQuery(
  api.recipes.getStorageUrl,
  isAvatarStorageId ? { storageId: avatarRaw as Id<"_storage"> } : "skip"
);

const avatarSrc = isAvatarStorageId
  ? (avatarStorageUrl || avatarFallback)
  : (avatarRaw || avatarFallback);
```

**Fallback** (inline SVG, always works):
```ts
const avatarFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2320b2aa'/%3E%3Ctext x='50' y='55' text-anchor='middle' dy='.1em' font-size='40' fill='white' font-family='sans-serif'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E";
```

Sizes:
- Profile page: `80×80px`
- Chef overlay on card: `28×28px`
- Chef row on detail page: `44×44px`

---

## 17. Section Label Style (recurring)

Used as the heading above chip groups, dietary sections, etc.

```css
font-size: 0.8rem;  /* or 0.75rem for profile field labels */
font-weight: 700;
color: #20b2aa;
text-transform: uppercase;
letter-spacing: 0.6px;
```

---

## 18. Scrollbars

Hidden globally across all browsers:

```css
html, body { scrollbar-width: none; -ms-overflow-style: none; }
*::-webkit-scrollbar { display: none; }
* { scrollbar-width: none; -ms-overflow-style: none; }
```

---

## 19. Transition Defaults

```css
button { transition: all 0.2s; }
button:disabled { opacity: 0.6; cursor: not-allowed; }

/* Card lift on hover */
.featured-recipe-box:hover { transform: translateY(-2px); }
```
