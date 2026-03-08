# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

Next.js 16 app using the App Router (`src/app/`), React 19, TypeScript, and Tailwind CSS v4.

- `src/app/layout.tsx` — Root layout with font and metadata configuration
- `src/app/page.tsx` — Home page
- `src/app/globals.css` — Global styles (Tailwind base)

This is a rooms-for-rent listing application in early development (just bootstrapped). New pages go in `src/app/` following Next.js App Router conventions. Shared components should be placed in `src/components/` (to be created).
