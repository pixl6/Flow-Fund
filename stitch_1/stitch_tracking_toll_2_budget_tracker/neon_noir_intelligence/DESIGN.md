---
name: Neon Noir Intelligence
colors:
  surface: '#13140b'
  surface-dim: '#13140b'
  surface-bright: '#393a2f'
  surface-container-lowest: '#0d0f07'
  surface-container-low: '#1b1c13'
  surface-container: '#1f2017'
  surface-container-high: '#292b21'
  surface-container-highest: '#34362b'
  on-surface: '#e4e3d4'
  on-surface-variant: '#c6c8b1'
  inverse-surface: '#e4e3d4'
  inverse-on-surface: '#303127'
  outline: '#90927d'
  outline-variant: '#464837'
  surface-tint: '#b8d246'
  primary: '#ffffff'
  on-primary: '#2b3400'
  primary-container: '#d4ef60'
  on-primary-container: '#5b6b00'
  inverse-primary: '#556500'
  secondary: '#ccbeff'
  on-secondary: '#332664'
  secondary-container: '#4a3d7c'
  on-secondary-container: '#baabf3'
  tertiary: '#ffffff'
  on-tertiary: '#302f3a'
  tertiary-container: '#e3e1ee'
  on-tertiary-container: '#64636f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d4ef60'
  primary-fixed-dim: '#b8d246'
  on-primary-fixed: '#181e00'
  on-primary-fixed-variant: '#404c00'
  secondary-fixed: '#e7deff'
  secondary-fixed-dim: '#ccbeff'
  on-secondary-fixed: '#1e0e4e'
  on-secondary-fixed-variant: '#4a3d7c'
  tertiary-fixed: '#e3e1ee'
  tertiary-fixed-dim: '#c7c5d2'
  on-tertiary-fixed: '#1b1b24'
  on-tertiary-fixed-variant: '#464651'
  background: '#13140b'
  on-background: '#e4e3d4'
  surface-variant: '#34362b'
  background-base: '#121212'
  background-surface: '#242424'
  border-subtle: rgba(255, 255, 255, 0.1)
  text-primary: '#FFFFFF'
  text-muted: '#888888'
  action-neon: '#E4FF6E'
  data-lavender: '#C4B5FD'
typography:
  h1:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  widget-title:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  body:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
  microcopy:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  sidebar-width: 80px
  container-padding: 2rem
  gutter: 1.5rem
  widget-gap: 1rem
---

# Design System Specification: Neon Noir Intelligence

## 1. Overview & Creative North Star
The Creative North Star is **"Neon Noir Intelligence."** This design language balances a high-tech, nocturnal atmosphere with vibrant, high-energy accents. It combines the sleekness of dark mode with the organic feel of soft UI (glassmorphism/neumorphism) and bold geometric typography.

## 2. Color Palette
- **Base App Background:** Very dark gray/near-black (#121212)
- **Card/Widget Backgrounds:** Slightly lighter dark gray (#242424) with 1px `rgba(255,255,255,0.1)` borders.
- **Primary Accent (Action):** Neon Yellow/Lime (#E4FF6E) - used for active nav, primary CTAs, and positive trends.
- **Secondary Accent (Data):** Soft Lavender/Purple (#C4B5FD) - used for headers and secondary data sets.
- **Typography:** Pure White (#FFFFFF) for primary text, Muted Gray (#888888) for subtext and axis labels.

## 3. Typography
- **Font Family:** Inter / Poppins (Geometric Sans-Serif)
- **H1 (Headers):** 24-28px Bold
- **H2 (Widget Titles):** 12-14px Semi-Bold, All-Caps
- **Body/Labels:** 12-14px Regular
- **Microcopy:** 10-11px Regular, Muted Gray

## 4. Layout & Visual Language
- **Sidebar:** Fixed width with icon-based navigation. Active states use asymmetrical organic background shapes.
- **Border Radius:** High roundness (20px - 24px) for cards and components.
- **Effects:** Smooth Bezier area charts with fading gradients, glassmorphism on headers, and subtle inner glows/inset shadows for depth.
- **Components:** Total budget cards with side actions, mini donut trend charts, and pill-shaped grouped bar charts.