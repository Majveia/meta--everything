# HANDOFF.md — meta//everything

## Current State

The app exists as a single-file React artifact (`meta-everything-app.jsx`) that runs in Claude.ai's artifact renderer. It is fully interactive — you can swipe between feeds, tap cards to open detail sheets, like/bookmark/share, search content, toggle themes, navigate between four views, and filter by topic.

This file is the visual source of truth. Every pixel, color, animation, and interaction pattern in it has been iterated on across ~12 design sessions.

## Decisions Made (Do Not Revisit)

These decisions were made deliberately through conversation. They are final.

### Kept
- Swipeable For You / Following feed tabs (the core interaction)
- Mixed card formats: LiveCard (full-width), StdCard (thumbnail), CompactCard (text-only)
- Platform-specific thumbnail patterns (diagonal lines for Twitch, play button for YouTube, etc.)
- Detail bottom sheet on card tap
- Scroll-aware sticky header
- Bottom navigation with 4 tabs: Home, Explore, Activity, Profile
- Light/dark mode with full palette system
- Command palette (⌘K)
- Notification dropdown from header bell icon
- Engagement row: views, like (with pop animation), comments, share, bookmark
- Skeleton loading on tab switch
- Time-grouped feed sections: "Live Now", "Recent", "Earlier"
- Author avatars (gradient circle with initial) on every card
- Halftone dot texture + ambient terracotta glow (the DNA of the design language)
- Functional search across content by title, author, and tags
- Topic filtering on Explore page
- Related content in detail sheet
- Profile with settings (theme toggle, notifications, haptic)
- Tag pills in detail sheet

### Removed (Don't Bring Back)
- Meta Loop Engine (was a dev tool, not a user feature — can live as hidden dev mode later)
- Today section (journal/tasks/habits — this is not a productivity app)
- Quick Capture input
- Stats row (streak/tasks done/loop cycles/confidence)
- Spaces cards (Journal/Tasks/Habits/Meta)
- Daily prompt section
- Contribution history
- Greeting ("Good morning." — was filler)
- Old-style tab bar (Journal/Tasks/Habits/Meta)
- Decorated search button (now a bare 14px magnifying glass icon)
- Decorated notification bell (now a bare 14px bell with 6px red dot)

## Content Data

There are 16 content items across all feeds. Each has: type, platform, title, author, subtitle, extra (expanded text for detail sheet), engagement metrics, and tags. See `allContent` array in the artifact.

Content is currently split:
- For You: indices 0-6 (Kai Cenat, 3Blue1Brown, Karpathy, Dwarkesh, user thread, CodeWithFire, Fireship)
- Following: indices 7-12 (ThePrimeagen, Veritasium, @deepmind_fan, Lenny, Tsoding, Ben Thompson)
- Explore trending: indices 13-15 (Veritasium math, Sam Altman, Veritasium gravity)

All items are searchable and filterable by tag.

## What's Next

### Immediate (Scaffold)
1. Set up Next.js project with App Router
2. Install and configure Tailwind, Framer Motion, Zustand
3. Load Instrument Serif + Outfit from Google Fonts
4. Set up CSS custom properties matching both palettes
5. Build theme context + toggle
6. Port all components from artifact into separate files

### Short-Term (Make It Real)
1. Persist likes, bookmarks, theme to localStorage via Zustand middleware
2. Add proper URL routing for bottom nav tabs
3. Add Framer Motion `AnimatePresence` for page transitions
4. Add proper touch gesture physics for swipe (use framer-motion drag)
5. Make detail sheet support back gesture / swipe-to-dismiss
6. Add haptic feedback on like/bookmark (navigator.vibrate)

### Medium-Term (Wire APIs)
1. YouTube Data API v3 — trending videos, channel content
2. X/Twitter API — user timeline, trending topics (may need proxy)
3. Twitch Helix API — live streams, viewer counts
4. Substack RSS feeds — parse for article content
5. Kick API — live streams (limited public API)
6. Implement pull-to-refresh on feeds
7. Add infinite scroll / pagination

### Long-Term
1. Push notifications (FCM / web push)
2. Real user auth
3. Personalized feed algorithm
4. Video/stream embeds in detail sheet
5. PWA with offline support
6. React Native port for App Store

## Design Language Summary

The visual identity is:
- **Halftone dissolution** — dot matrix textures that breathe
- **Fire in the void** — terracotta (#BF5A3C) as sacred accent on deep black (#0A0A0A)
- **Bold serifs at negative tracking** — Instrument Serif at -0.02 to -0.03em
- **Warm neutrals** — bone (#E8E0D4) for text, ash (#6B6560) for secondary, never pure white
- **Considered motion** — cubic-bezier(.16,1,.3,1) for everything, staggered card entrances, spring-back interactions
- **Platform respect** — each platform gets its own color AND visual thumbnail treatment, not just a tinted gradient

The app should feel like opening something someone made by hand, not something a framework generated.
