# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@import ".claude/prd.md"
@import ".claude/plan.md"

## Development Commands

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production (runs TypeScript compilation then Vite build)
- `npm run lint` - Run ESLint checks
- `npm run preview` - Preview production build locally
- `npm run format` - Format code with Prettier

## Hooks

```json
{
  "postToolUse": "npm run format"
}
```

## Project Overview

This is a **Carb Cycling Diet Calculator** web application (碳循环饮食计算器) built with React + TypeScript + Vite. The app calculates personalized carb cycling nutrition plans based on user inputs like body weight, body type, and protein coefficients.

## Key Features to Implement

- **Multi-theme support**: light/dark/system with localStorage persistence
- **Dynamic particle background**: Using react-tsparticles with theme-responsive colors
- **Glassmorphism UI**: Semi-transparent cards with backdrop blur effects
- **Internationalization**: Chinese (zh-CN) and English (en) support
- **Unit conversion**: Metric (kg) and Imperial (lb) system switching
- **Export functionality**: Copy to clipboard (Markdown) and PNG image export
- **Responsive design**: Desktop (sidebar layout) and mobile (stacked layout)

## Architecture

**Current State**: Minimal Vite + React template
**Target Architecture** (from development plan):

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── layout/               # Header, Footer, ThemeProvider
│   ├── core/                 # InputForm, ResultCard, Summary, DailyTable
│   └── shared/               # ParticleBackground, LanguageSwitcher
├── lib/
│   ├── calculator.ts         # Core nutrition calculation logic
│   ├── i18n.ts              # Internationalization setup
│   └── utils.ts             # Utility functions
└── App.tsx
```

## Tech Stack (Planned)

- **UI Framework**: shadcn/ui (Radix-based)
- **Form Management**: react-hook-form + zod validation
- **Animations**: react-tsparticles for background
- **i18n**: i18next for multi-language support
- **Export**: html-to-image for PNG generation
- **Styling**: CSS modules with glassmorphism effects

## Development Notes

- The project is currently a minimal template - needs full implementation according to PRD
- No testing framework is configured yet
- Performance targets: <120KB initial JS bundle, 60fps particle animations
- Accessibility: Must support keyboard navigation and prefers-reduced-motion
- Browser support: Chrome/Edge/Firefox/Safari (last 2 major versions)
