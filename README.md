# The Prymm Group LLC — Landing Page

> **Sustainable Solutions. Lasting Relationships.**

Bauhaus-inspired single-page landing page for [The Prymm Group LLC](https://www.prymmgroup.com).

## Stack

| Layer | Tech |
|---|---|
| Markup | Semantic HTML5 |
| Styles | Vanilla CSS (custom properties, grid, flexbox) |
| Interactions | Vanilla JavaScript (IntersectionObserver, no dependencies) |
| Fonts | Google Fonts — Barlow Condensed (headings), Barlow (body) |

## File Structure

```
prymmgroup/
├── index.html     # Single-page layout
├── style.css      # Bauhaus design system
├── main.js        # Scroll reveal + mechanical interactions
└── README.md
```

## Design System

### Palette
| Token | Hex | Use |
|---|---|---|
| `--red` | `#D62828` | Primary CTA, Industrial division, emphasis |
| `--yellow` | `#F5C400` | Accent, hover states, hero sub-headline |
| `--blue` | `#1A3EBF` | Technology division, structural depth |
| `--black` | `#0D0D0D` | Hero background, dark sections |
| `--white` | `#F7F5F0` | Light sections, body canvas |

### Typography
- **Barlow Condensed 900** — All major headings (mechanically authoritative)
- **Barlow 700** — Labels, navigation, stats
- **Barlow 400** — Body copy

### Interactions
All transitions are **instant or ≤ 300ms with linear/cubic-bezier easing** — no spring physics, no lengthy fades. Every element snaps into place with engineered exactness per Bauhaus utilitarian principles.

## Page Structure
1. **Nav** — Fixed, black, red underline (shifts to yellow on scroll)
2. **Hero** — Full-viewport, geometric block overlay, stat strip
3. **Mission Band** — Red, bold quote with structural accent
4. **Divisions** — 3-column grid, color-coded by division
5. **Product Spotlight** — Waste-to-Energy, dark bg with benefit list
6. **Manifesto Band** — RGB blocks, uppercase manifesto
7. **Contact / CTA** — Clean two-column, direct contact detail strip
8. **Footer** — Minimal, centered

## Local Development

No build step required. Serve directly:

```bash
# Python
python3 -m http.server 3000

# Node (npx)
npx serve .
```

Then open `http://localhost:3000`.

## Deployment

Drop the three files (`index.html`, `style.css`, `main.js`) into any static host:
- **Netlify / Vercel** — drag-and-drop or connect this repo
- **GitHub Pages** — enable in repository Settings → Pages → `main` branch root
- **Nginx/Apache** — copy files to web root

---

*The Prymm Group LLC · Wilmington, Delaware, USA · info@prymmgroup.com · +1 909 562 6640*
