# Radar Vibe - GPS-Based Social Map Platform

## Overview
Radar Vibe is a luxury Black & Gold themed GPS-based social map for real-time meetups. Users discover nearby vibes and people on a dark interactive map, create live or planned events, and message each other. Features "Two Worlds" visibility logic, premium subscriptions, and multi-language support.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + Leaflet.js (dark CartoDB tiles)
- **Backend**: Express.js with session-based auth
- **Database**: PostgreSQL via Drizzle ORM
- **Theme**: Black & Gold luxury (#000000 background, #B8860B gold accents)
- **i18n**: 7 languages (EN, IT, FR, DE, ES, PT, SV)

## Key Features
- **Two Worlds**: Free users see only free users (red dots), premium sees everyone (gold pulsing dots)
- **Vibes**: LIVE (4h auto-expiry) and PLANNED (premium-only, calendar scheduling)
- **Messaging**: 3 msgs/day for free, unlock 3 more via rewarded ad, unlimited for premium
- **Premium**: Monthly (1.99) / Yearly (8.99) - Stripe-ready
- **Ghost Mode**: Premium-only invisible browsing
- **Bussola**: Proximity compass - keyword-based search within 10km
- **Ad System**: Fixed 50px banner + interstitials before creating vibes, editing profile, unlocking messages
- **User Profiles**: Bio, avatar, social links (Instagram, Discord, PSN), keywords
- **Daily Cleanup**: Auto-removes expired vibes and resets message quotas

## Project Structure
- `client/src/App.tsx` - Root with auth flow (login/register -> radar page)
- `client/src/pages/auth.tsx` - Login/register page
- `client/src/pages/radar.tsx` - Main map page with all state management
- `client/src/components/radar-map.tsx` - Leaflet map with two-worlds markers
- `client/src/components/profile-modal.tsx` - Profile editing (social links, keywords, ghost mode, language)
- `client/src/components/messaging-modal.tsx` - Conversation list + chat
- `client/src/components/create-event-modal.tsx` - Create LIVE/PLANNED vibes
- `client/src/components/event-detail.tsx` - Vibe detail view
- `client/src/components/premium-modal.tsx` - Premium subscription modal
- `client/src/components/ad-banner.tsx` - Banner + interstitial ad components
- `client/src/components/modal-wrapper.tsx` - Reusable modal with animations, X close, ESC key, overlay click
- `client/src/components/premium-settings-modal.tsx` - Premium theme system + perks
- `client/src/lib/store.ts` - Client hooks (location, premium, ads)
- `client/src/lib/theme.ts` - Premium theme system (Dark Luxury, Gold, Custom Colors)
- `client/src/lib/i18n.ts` - Multi-language translation system
- `server/routes.ts` - All API endpoints
- `server/storage.ts` - Database storage layer
- `shared/schema.ts` - Drizzle schema (users, vibes, messages)

## API Endpoints
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user
- `PATCH /api/profile` - Update profile
- `POST /api/location` - Update user location
- `POST /api/ghost-mode` - Toggle ghost mode
- `GET /api/users/visible` - Get visible users (two-worlds filtered)
- `GET /api/bussola` - Keyword proximity search
- `GET /api/vibes` - List vibes
- `GET /api/vibes/:id` - Get single vibe
- `POST /api/vibes` - Create vibe
- `GET /api/conversations` - List conversations
- `GET /api/messages/:userId` - Get messages with user
- `POST /api/messages` - Send message
- `POST /api/messages/unlock` - Unlock bonus messages via ad
- `POST /api/subscribe` - Premium subscription

## Database Schema
- **users**: id, username, password, displayName, bio, avatarUrl, isPremium, premiumPlan, premiumExpiresAt, ghostMode, latitude, longitude, lastLocationUpdate, instagram, discord, psnId, keywords[], language, messagesToday, messagesResetAt, createdAt
- **vibes**: id, creatorId, title, description, latitude, longitude, photoUrl, photos[], type (live/planned), scheduledAt, expiresAt, createdAt
- **messages**: id, senderId, receiverId, content, type, createdAt

## Recent Changes
- 2026-02-22: Photo upload system (up to 3 photos per vibe with slider in event detail), profile picture change with video ad gate (5s countdown for free users), complete 7-language i18n overhaul (~90 keys per language including premSettings), mobile-first UI redesign (rounded-[20px] modals, h-12 buttons, rounded-2xl inputs, active:scale-95 animations, z-index 9999 modals, z-index 1 map), FAB for create vibe on mobile, fixed slideIndex reset on vibe change
- 2026-02-22: UI overhaul - centralized modals with ModalWrapper component, smooth CSS transitions, X close buttons, map.invalidateSize() on modal close, Premium Theme System (Dark Luxury/Gold/Custom), Premium Perks placeholders (VIP badge, exclusive icons, extended radar), premium settings modal
- 2026-02-19: Complete rebuild with new architecture - user auth, Two Worlds visibility, messaging system, vibes (LIVE/PLANNED), premium subscriptions, ghost mode, Bussola proximity search, multi-language support, ad system, daily cleanup
