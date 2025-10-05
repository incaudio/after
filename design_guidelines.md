# Mate Music Search Engine - Design Guidelines

## Design Approach
**Reference-Based with Custom Innovation**: Drawing inspiration from jeton.com's smooth animations and glassmorphism aesthetic, combined with music platform patterns from Spotify and SoundCloud. The design prioritizes an immersive audio-visual experience while maintaining search utility.

**Design Principles**:
- Fluid, responsive animations that don't compromise performance
- Dark, atmospheric interface that puts content first
- Seamless transitions between search, playback, and AI features
- Visual feedback for audio interactions

## Core Design Elements

### A. Color Palette

**Dark Mode Primary** (default):
- Background Base: 230 35% 8% (deep violet-blue)
- Background Elevated: 235 30% 12% (cards, player)
- Background Glass: 240 40% 18% with 40% opacity (glassmorphic overlays)
- Primary Violet: 270 60% 55% (CTAs, active states)
- Primary Blue: 240 70% 50% (accents, links)
- Gradient Accent: Linear from 270 60% 55% to 240 70% 50%

**Text Colors**:
- Primary Text: 0 0% 95%
- Secondary Text: 240 20% 70%
- Muted Text: 240 15% 50%

**Functional Colors**:
- Success/Playing: 150 60% 50%
- Warning: 40 90% 60%
- Error: 0 70% 60%

### B. Typography

**Font Families**:
- Primary: 'Inter' for UI elements and body text (via Google Fonts)
- Display: 'Poppins' for headings and brand elements (via Google Fonts)
- Mono: 'JetBrains Mono' for timestamps and technical info

**Type Scale**:
- Hero/Display: text-6xl (Poppins SemiBold)
- Page Heading: text-4xl (Poppins Medium)
- Section Heading: text-2xl (Poppins Medium)
- Body Large: text-lg (Inter Regular)
- Body: text-base (Inter Regular)
- Small: text-sm (Inter Regular)
- Micro: text-xs (Inter Medium)

### C. Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20 for consistent rhythm
- Micro spacing: p-2, gap-2
- Standard spacing: p-4, gap-4, m-4
- Section spacing: py-12, py-16, py-20
- Large spacing: p-8, gap-8

**Grid System**:
- Search results: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Max content width: max-w-7xl
- Player controls: Flexbox with gap-4

### D. Component Library

**Navigation**:
- Fixed top bar with glassmorphic background (backdrop-blur-xl)
- Logo left, search bar center, user actions right
- Height: h-16 with px-6 padding
- Sticky behavior with smooth shadow on scroll

**Search Interface**:
- Prominent search bar: rounded-2xl with glass effect, h-14
- Search icon left (Heroicons), filter button right
- Auto-suggest dropdown with blur background
- Vibe Match button: Gradient fill with microphone icon, pulsing animation when active

**Music Player** (Bottom Fixed):
- Height: h-24, glassmorphic background with backdrop-blur-2xl
- Left: Album art (w-20 h-20 rounded-lg), track info
- Center: Playback controls (previous, play/pause, next, shuffle, repeat)
- Right: Volume slider, visualizer toggle, external link button
- Progress bar: Full width above controls, gradient fill
- Visualizer: Canvas element, h-16, frequency bars with violet-blue gradient

**Search Results Cards**:
- Card: Glass effect background, rounded-xl, p-4
- Thumbnail: aspect-video, rounded-lg with hover scale
- Title: text-lg font-medium, truncate after 2 lines
- Artist: text-sm text-secondary
- Platform badge: Small pill (YouTube/SoundCloud) with platform colors
- Duration overlay on thumbnail: bottom-right, text-xs

**Vibe Match Interface**:
- Full-screen modal with animated gradient background
- Center: Animated waveform visualization during listening
- Microphone icon pulsing with audio input levels
- Results display with vibe tags and confidence scores

**Filters & Sort Panel**:
- Slide-in panel from right: w-80
- Options: Radio buttons with custom styling (violet accent)
- Quick filters: Chip-style buttons with glass effect
- Apply button: Gradient fill, sticky at bottom

### E. Animations & Interactions

**Micro-animations** (use sparingly):
- Button hover: scale-105 transition-transform
- Card hover: Subtle glow effect, translate-y-1
- Loading: Spinning gradient border on search
- Vibe Match: Pulsing microphone icon, waveform visualization

**Transitions**:
- Page transitions: fade-in with 200ms duration
- Modal/panel: slide-in from direction, 300ms
- Player expand: smooth height animation, 400ms

**Performance-First**:
- Use CSS transforms over position changes
- RequestAnimationFrame for visualizer
- Debounce search input (300ms)
- Lazy load thumbnails with intersection observer

### F. Glassmorphism Implementation

**Glass Cards**:
```
Background: bg-white/10 dark:bg-white/5
Backdrop: backdrop-blur-xl
Border: border border-white/20
Shadow: shadow-2xl with colored glow
```

**Elevated Glass** (Player, Modals):
```
Background: bg-violet-500/20
Backdrop: backdrop-blur-2xl
Border: border-2 border-white/30
```

## Images

**Hero Section**: NO traditional hero image. Instead:
- Animated gradient background with floating music notes (CSS)
- Centered search bar as primary focal point
- Subtle animated waveform pattern in background

**Content Images**:
- Album/Video thumbnails: Aspect ratio 16:9, lazy-loaded
- Artist images: Circular (rounded-full), w-12 h-12 in results
- Placeholder: Violet gradient with music note icon

**Icons**:
- Use Heroicons via CDN (outline style for navigation, solid for actions)
- Music visualizer: Custom canvas with Web Audio API
- Platform badges: Use Font Awesome brand icons (YouTube, SoundCloud)

## Accessibility & Performance

- Maintain WCAG AA contrast ratios (violet 270 60% 55% on dark backgrounds passes)
- Keyboard navigation: Focus rings with violet accent
- Screen reader labels for all interactive audio elements
- Reduce motion: Disable animations for prefers-reduced-motion
- Optimize visualizer with throttled updates (60fps cap)
- Use CSS containment for scroll performance