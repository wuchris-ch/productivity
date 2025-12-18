# Habit Tracker

A minimal, privacy-focused habit tracking app that runs entirely in your browser. Your data stays on your device, with optional auto-save to a local JSON file.

**Live Demo:** https://wuchris-ch.github.io/productivity/

## Features

- Track daily habits with customizable active days
- Organize habits into time-based areas (Morning, Afternoon, Evening)
- Drag-and-drop reordering
- Visual year calendar with completion history
- Streak tracking and statistics
- Dark mode
- **No account required, no server, no database**

## How Data Storage Works

This app uses a hybrid storage approach designed for privacy and data safety:

### Primary: localStorage (automatic)

When you first use the app, habits are stored in your browser's localStorage. This works immediately with no setup, but has limitations:
- Data is browser-specific (won't sync across devices)
- Can be lost if you clear browser data

### Secondary: File System Access API (opt-in)

For long-term data safety, you can connect a local JSON file:

1. Click "New File" in the header
2. Choose where to save (e.g., `~/Documents/habits.json` or a cloud-synced folder)
3. The app auto-saves to this file on every change

**How it works technically:**

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React State    │────▶│  localStorage    │     │  Local File     │
│  (in memory)    │     │  (always synced) │     │  (if connected) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                                                 ▲
        │                                                 │
        └─────────────────────────────────────────────────┘
                    File System Access API
                    (auto-save on change)
```

The File System Access API is a browser feature that lets web apps read/write to files you explicitly grant access to. Your file handle is persisted in IndexedDB, so the app remembers your save location across sessions.

**Browser Support:** Chrome, Edge, Opera (Chromium-based browsers only)

## Architecture

### Tech Stack

- **Next.js 14** with App Router
- **React 18** with hooks and context
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **@dnd-kit** for drag-and-drop

### Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page (Quick View / Calendar View)
│   ├── habit/page.tsx     # Habit detail page with yearly calendar
│   └── layout.tsx         # Root layout with providers
│
├── components/
│   ├── areas/             # Area management (drag-drop containers)
│   ├── calendar/          # Calendar visualizations
│   ├── habits/            # Habit cards and creation modal
│   ├── ui/                # Reusable UI components
│   └── views/             # Main view layouts
│
├── context/
│   ├── HabitContext.tsx   # Central state management
│   └── FileStorageContext.tsx  # File System Access API wrapper
│
├── lib/
│   ├── types.ts           # TypeScript interfaces
│   ├── storage.ts         # localStorage utilities
│   ├── fileStorage.ts     # File System Access API utilities
│   ├── statistics.ts      # Streak and completion calculations
│   └── dates.ts           # Date manipulation helpers
│
└── types/
    └── file-system-access.d.ts  # TypeScript declarations for FS API
```

### State Management

The app uses React Context for global state, avoiding external state libraries:

```typescript
// HabitContext provides:
interface HabitContextType {
  habits: Habit[];
  areas: Area[];
  entries: HabitEntry[];       // Daily completion records

  // CRUD operations
  addHabit, updateHabit, deleteHabit, moveHabit, reorderHabits,
  addArea, updateArea, deleteArea, reorderAreas,
  toggleEntry, getEntryStatus,

  // Data sync (for file storage integration)
  loadData, onDataChange,
}
```

State flows unidirectionally:
1. User action triggers context method
2. Context updates state
3. State change triggers localStorage save
4. If file connected, FileStorageContext receives change notification and writes to file

### Data Model

```typescript
interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  areaId: string;
  activeDays: number[];  // 0=Sun, 1=Mon, ..., 6=Sat
  createdAt: string;
  order: number;
}

interface Area {
  id: string;
  name: string;
  order: number;
}

interface HabitEntry {
  habitId: string;
  date: string;          // YYYY-MM-DD format
  status: 'done' | 'failed' | null;
}
```

### File Storage Implementation

The File System Access API integration involves three layers:

1. **lib/fileStorage.ts** - Low-level utilities
   - `pickSaveFile()` / `pickOpenFile()` - Show native file picker
   - `writeToFile()` / `readFromFile()` - Read/write JSON
   - `saveFileHandle()` / `getStoredFileHandle()` - Persist handle in IndexedDB
   - `verifyPermission()` - Check/request file access permission

2. **context/FileStorageContext.tsx** - React integration
   - Manages connection state (disconnected, connected, saving, etc.)
   - Exposes `connectFile()`, `saveData()`, `openExistingFile()`
   - Handles permission re-requests on page reload

3. **components/ui/FileStorageStatus.tsx** - UI component
   - Shows current connection status
   - Subscribes to HabitContext changes via `onDataChange()`
   - Triggers auto-save when data changes

### Static Export for GitHub Pages

Next.js apps typically need a server, but this app is configured for static export:

```javascript
// next.config.mjs
const nextConfig = {
  output: 'export',           // Generate static HTML
  basePath: '/productivity',  // GitHub Pages subpath
  images: { unoptimized: true },
};
```

The habit detail page uses query parameters (`/habit?id=xxx`) instead of dynamic routes (`/habit/[id]`) because static export requires all paths to be known at build time.

## Development

```bash
npm install
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Build for production
npm run lint     # Run ESLint
```

## Deployment

The app auto-deploys to GitHub Pages on every push to `main` via GitHub Actions. The workflow:

1. Checks out code
2. Installs dependencies
3. Runs `npm run build` (outputs to `./out`)
4. Deploys `./out` to GitHub Pages

See `.github/workflows/deploy.yml` for the full configuration.

## Privacy

- All data stays in your browser or local file
- No analytics, tracking, or external requests
- No user accounts or authentication
- Works offline after initial load
