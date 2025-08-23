# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- `npm run dev` - Start development server (runs on port 3000)
- `npm run build` - Build for production  
- `npm run preview` - Preview production build (port 4173)
- `npm run lint` - Run ESLint on codebase

## Project Overview

This is a React-based medication interaction verification portal that helps pharmacists analyze drug interactions using AI. The system integrates with Supabase (PostgreSQL) for data storage and OpenAI GPT-4o-mini for intelligent analysis.

## Architecture

### Frontend Stack
- **React 18** with **Vite** build tool
- **React Router** for client-side routing  
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

### Pre-loaded Medications
System includes common drugs like benzodiazepines, antiepileptics, antipsychotics, cardiovascular medications, and diabetes treatments.