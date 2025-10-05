# Mate - Music Search Engine

## Overview
Mate is a powerful music search engine with AI-powered vibe matching capabilities. Built with a stunning violet and dark blue themed interface inspired by jeton.com, featuring glassmorphism effects and smooth animations.

## Key Features

### Core Functionality
- **Multi-Platform Search**: Search across YouTube (and SoundCloud when available)
- **AI Vibe Match**: Record yourself humming and let AI identify the vibe to find similar songs
- **Advanced Filtering**: Sort by relevance, newest, popularity, or public domain
- **In-App Music Player**: Beautiful player with NCS-style 3D particle visualizer, like/download buttons
- **Library Management**: Playlists, liked songs, and saved songs with responsive sidebar
- **Mobile Gestures**: Swipe from left edge to open sidebar, swipe left to close
- **Audio Recognition**: Shazam-like song identification from audio clips

### Technology Stack
**Frontend**:
- React + TypeScript
- Tailwind CSS with custom violet/blue theme
- Framer Motion for smooth animations
- Web Audio API for visualizations
- TanStack Query for data fetching
- Wouter for routing

**Backend**:
- Express.js
- YouTube Data API v3 (via Replit integration)
- OpenAI GPT-5 for vibe analysis (200+ musical vibes)
- Whisper API for audio transcription

## Architecture

### Data Flow
1. User searches or uses Vibe Match
2. Frontend sends query to backend API
3. Backend searches YouTube/processes AI request
4. Results displayed in glassmorphic cards
5. User clicks to play - opens in embedded player with visualizer

### Key Files
- `client/src/pages/home.tsx` - Landing page with hero search and sidebar toggle
- `client/src/pages/search.tsx` - Search results page with sidebar toggle
- `client/src/components/music-player.tsx` - Music player with 3D visualizer and like/download buttons
- `client/src/components/library-sidebar.tsx` - Responsive sidebar with swipe gestures and library management
- `client/src/components/vibe-match-modal.tsx` - AI vibe matching interface
- `server/routes/library.ts` - API routes for playlists, liked songs, and saved songs
- `server/lib/youtube.ts` - YouTube API integration
- `server/lib/openai-service.ts` - AI vibe analysis
- `shared/schema.ts` - Type definitions

### Design System
- **Primary Colors**: Violet (270° 60% 55%) and Blue (240° 70% 50%)
- **Background**: Deep violet-blue (230° 35% 8%)
- **Typography**: Inter (body), Poppins (display), JetBrains Mono (mono)
- **Effects**: Glassmorphism with backdrop-blur, gradient animations

## Recent Changes (October 5, 2025)
- **Fresh GitHub Import Setup - Completed**: Successfully configured project for Replit environment
  - Installed all npm dependencies (505 packages)
  - Configured PostgreSQL database and pushed schema using Drizzle ORM
  - Added critical `allowedHosts: true` to Vite config for Replit proxy support
  - Configured workflow to run `npm run dev` on port 5000 with webview output
  - Configured autoscale deployment with build (`npm run build`) and run (`npm run start`) commands
  - Created .gitignore file with Node.js best practices
  - Database schema includes: users, songs, playlists, liked_songs, saved_songs tables
  - Frontend successfully loading with beautiful violet/blue glassmorphic interface
  - Backend server running on port 5000 with Express + Vite middleware
  - YouTube API integration available but needs setup (connector:ccfg_youtube_11A9C5A8B843451A9459CB5545)
  - OpenAI API key needed for AI vibe matching features
- Implemented complete frontend with jeton.com-inspired animations
- Built fully functional music player with:
  - YouTube IFrame API for actual playback control
  - Enhanced NCS-style 3D particle sphere visualizer with stronger glow effects
  - Smooth bass-reactive animations with gradient effects
  - Real-time play/pause control
  - Volume control integration
  - Site-themed violet/blue gradient visualization
  - Like/unlike functionality with heart button and visual feedback
  - Download button for easy access to track sources
- Updated UI design:
  - Fully rounded (pill-shaped) search bars on both home and search pages
  - Glassmorphic blurred background on search buttons
  - Animated "Search" button that fades in when typing
  - About page text updated to '"Mate." is more than just a music search engine'
  - Removed About/Contact navigation from search results header for cleaner UI
- **Library Management System**:
  - Responsive sidebar with playlists, liked songs, and saved songs sections
  - Menu toggle button in top left corner for easy access
  - Mobile swipe gesture support (swipe from left edge to open, swipe left to close)
  - Full CRUD operations for playlists via backend API
  - Like/unlike songs with real-time UI updates
  - Backend routes for library management in `server/routes/library.ts`
  - Uses DEFAULT_USER_ID for single-user mode (no auth required)
- Added OpenAI GPT-5 powered vibe matching with 200+ vibes
- Configured dark mode violet/blue theme
- Added advanced filtering and sorting options
- Set up Replit environment with proper Vite configuration for proxy support

## Environment Variables & Integrations
- **YouTube API**: ✅ Connected via Replit YouTube connector (connection:conn_youtube_01K6S8YVRSSRPEVJSSK4P9Z6VQ)
  - Full OAuth authentication with read/write permissions
  - Music search fully functional
- **PostgreSQL Database**: ✅ Connected and schema deployed
  - `DATABASE_URL`: postgresql://postgres:password@helium/heliumdb?sslmode=disable
  - Tables: users, songs, playlists, playlist_songs, liked_songs, saved_songs
- `OPENAI_API_KEY`: ⚠️ Optional - OpenAI API key for vibe matching (AI features)
  - The app runs without it, but vibe matching features will be disabled
  - Can be added via Replit Secrets when needed
- `SESSION_SECRET`: Session secret for Express (auto-generated if not set)

## Future Enhancements
- User accounts with saved playlists
- SoundCloud API integration (requires OAuth setup)
- Real-time collaborative playlists
- Lyrics display with synchronized highlighting
- Download functionality for public domain tracks
- Enhanced audio recognition using dedicated services
