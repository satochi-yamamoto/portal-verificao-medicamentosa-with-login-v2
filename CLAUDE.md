# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- `npm run dev` - Start development server (runs on port 3000)
- `npm run build` - Build for production  
- `npm run preview` - Preview production build (port 4173)
- `npm run lint` - Run ESLint on codebase
- `npm run check-router` - Verify React Router v7 configuration
- `npm run check-tailwind` - Verify Tailwind CSS configuration
- `npm run check-performance` - Verify performance fixes and optimizations
- `npm run test-router` - Full React Router v7 compatibility test
- `npm run test-performance` - Performance fixes validation with build test
- `npm run test-complete` - Complete system diagnostics (Tailwind + Router + Performance + Build)

## Project Overview

This is a React-based medication interaction verification portal that helps pharmacists analyze drug interactions using AI. The system integrates with Supabase (PostgreSQL) for data storage and OpenAI GPT-4o-mini for intelligent analysis.

## Architecture

### Frontend Stack
- **React 18** with **Vite** build tool
- **React Router v7** with v7 future flags enabled (v7_startTransition, v7_relativeSplatPath)
- **Tailwind CSS** with custom theme colors (primary, success, warning, danger)
- **Lucide React** for icons, **React Hot Toast** for notifications

### Backend Integration
- **Supabase** as Backend-as-a-Service (PostgreSQL database)
- **OpenAI API** for AI-powered drug interaction analysis
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_OPENAI_API_KEY`

### Key Application Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.jsx      # Main app layout with navigation
│   ├── MedicationSelector.jsx  # Drug selection interface
│   ├── InteractionCard.jsx     # Interaction display card  
│   ├── AnalysisReport.jsx      # AI analysis reports
│   └── ErrorBoundary.jsx       # Error handling
├── pages/              # Route components
│   ├── DrugAnalysis.jsx        # Main AI analysis page
│   ├── DrugInteractions.jsx    # Known interactions database
│   ├── DrugDatabase.jsx        # Medication CRUD management
│   └── Reports.jsx             # Analytics and consultation history
├── services/           # Business logic
│   ├── database.js             # Supabase database operations
│   ├── interactionService.js   # Drug interaction logic
│   └── medicationCache.js      # Caching layer
└── lib/
    ├── supabase.js     # Supabase client config + database schemas
    └── openai.js       # OpenAI API integration
```

## Database Schema

Core tables defined in `database/schema_fixed.sql`:
- **medications**: Drug catalog with therapeutic classifications
- **drug_interactions**: Known interaction pairs with severity levels
- **consultations**: AI analysis history and pharmacist notes  
- **scientific_sources**: Evidence-based references

The database uses Row Level Security (RLS) policies for access control.

## Development Notes

### Database Setup
- Use `database/schema_fixed.sql` (not `schema.sql`) to avoid PostgreSQL extension issues
- Run `database/interactions_data.sql` after schema setup for sample data
- Multiple refactored components exist (e.g., `DrugAnalysisRefactored.jsx`) - check which version is actively used

### Configuration 
- Vite configured for SPA with history API fallback
- Development server runs on port 3000, preview on port 4173  
- Manual chunk splitting configured for vendor libraries (React, Supabase, OpenAI)

### AI Integration
- Uses OpenAI GPT-4o-mini for drug interaction analysis
- Hybrid approach with both local database lookups and AI analysis
- All AI recommendations require pharmacist validation (legal disclaimer applies)

### React Router v7 Configuration
- Uses `createBrowserRouter` with modern route structure
- Future flags enabled: `v7_startTransition`, `v7_relativeSplatPath`
- Custom hooks: `useRouterMonitoring`, `useOptimizedNavigation`
- Navigation indicators with `startTransition` for optimal performance
- No React Router v7 warnings - fully compatible
- Verification scripts: `npm run check-router` and `npm run test-router`

### Tailwind CSS Configuration
- Fully configured and operational (verified via `npm run check-tailwind`)
- Custom components: `.btn`, `.card`, `.input`, `.label`, `.select`, `.textarea`
- Portal-specific classes: `.interaction-high`, `.interaction-medium`, `.interaction-low`
- Status classes: `.status-active`, `.status-inactive`, `.status-pending`
- Test page available at `/tailwind-test` for visual verification
- CSS bundle size: ~40KB (indicates proper Tailwind compilation)

### Performance Optimizations
- **React Markdown**: Fixed `className` prop error (v10+ compatibility)
- **Error Boundaries**: `MarkdownErrorBoundary` for graceful markdown error handling
- **setTimeout Optimization**: `optimizedSetTimeout` using `requestAnimationFrame` for better performance
- **Performance Utilities**: Debounce, throttle, performance monitoring, task scheduling
- **Performance Hooks**: `usePerformance`, `useAsyncPerformance`, `useMemoryMonitor`, `useNetworkMonitor`
- **Vite HMR**: Optimized hot module replacement to prevent duplicate connections
- **Build Performance**: 15.30s build time, optimized asset chunking
- **Validation**: `npm run check-performance` for automated performance verification

### Pre-loaded Medications
System includes common drugs like benzodiazepines, antiepileptics, antipsychotics, cardiovascular medications, and diabetes treatments.