# RestoCalc

## Overview
RestoCalc is a restaurant calculator application for EUR/BGN currency conversion. This is a React + TypeScript + Vite application with Tailwind CSS styling and shadcn/ui components.

Original Figma design: https://www.figma.com/design/NSCYhi1p8tFKHzsxqkl7gc/RestoCalc

## Project Architecture
- **Frontend Framework**: React 18.3.1
- **Build Tool**: Vite 6.3.5
- **Language**: TypeScript 5.3.3
- **Styling**: Tailwind CSS v4.1.3 (precompiled CSS in index.css)
- **UI Components**: shadcn/ui components with Radix UI primitives
- **Icons**: lucide-react

## Project Structure
```
RestoCalc/
├── src/
│   ├── components/
│   │   ├── ui/          # shadcn/ui components (buttons, inputs, dialogs, etc.)
│   │   ├── figma/       # Figma-specific components
│   │   ├── AppHeader.tsx
│   │   ├── CalculatorScreen.tsx  # Main calculator screen
│   │   ├── CurrencySelectModal.tsx
│   │   ├── FullScreenChange.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── InfoScreen.tsx
│   ├── assets/          # Static assets
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx          # Main app component with tab navigation
│   ├── main.tsx         # Entry point
│   └── index.css        # Tailwind CSS precompiled styles
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Development Setup
- Development server runs on port 5000
- Configured for Replit environment with proper HMR (Hot Module Replacement) over WSS
- TypeScript strict mode enabled

## Recent Changes (Oct 20, 2025)
1. Created TypeScript configuration files (tsconfig.json, tsconfig.node.json)
2. Updated Vite config to use port 5000 and host 0.0.0.0 for Replit environment
3. Added `allowedHosts: true` to Vite config to bypass host verification (required for Replit proxy)
4. Configured HMR to work with Replit's proxy setup
5. Added React and TypeScript type definitions to devDependencies
6. Installed all project dependencies
7. Created .gitignore for Node.js projects
8. Set up deployment configuration for autoscale deployment

## Key Features
- Three-tab interface: Calculator, History, Information
- EUR/BGN currency conversion with fixed exchange rate (1.95583)
- Modal dialogs for currency selection
- Full-screen change display
- Responsive design with max-width constraint (mobile-optimized)

## Environment Configuration
- Server binds to 0.0.0.0:5000 (required for Replit)
- HMR configured to work with Replit's secure WebSocket proxy
- Build output directory: `build/`
