# SeeVid Web 🔮✨

A modern web application for SeeVid built with **Next.js**, **React**, **TypeScript**, and **Tailwind CSS**, featuring internationalization (i18n) across 13 languages, environment isolation (`.env.dev`, `.env.prod`), and themed 404/500 error pages.

---

## 📁 Directory Structure

```
magic-swap-puzzle-web/
├── .env.dev                 # Local development environment configuration
├── .env.prod                # Production environment configuration
├── .env.example             # Environment template
├── .gitignore               # Git ignored patterns
├── next.config.js           # Next.js config with i18n
├── package.json             # Scripts & dependencies
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.ts       # Tailwind theme configuration
├── tsconfig.json            # TypeScript configuration
├── public/                  # Public static assets
│   ├── assests/             # Static assets (requested)
│   ├── assets/              # Static assets
│   ├── background/          # Background illustrations & textures
│   ├── font/                # Custom webfonts
│   ├── icons/               # SVG & raster icons
│   ├── images/              # Game artwork & images
│   ├── js/                  # Client-side scripts
│   └── locales/             # i18n JSON translations (13 languages)
│       ├── de/common.json   # German
│       ├── en/common.json   # English
│       ├── es/common.json   # Spanish
│       ├── fil/common.json  # Filipino
│       ├── fr/common.json   # French
│       ├── hi/common.json   # Hindi
│       ├── it/common.json   # Italian
│       ├── ko/common.json   # Korean
│       ├── ms/common.json   # Malay
│       ├── pt/common.json   # Portuguese
│       ├── ru/common.json   # Russian
│       ├── th/common.json   # Thai
│       └── uk/common.json   # Ukrainian
└── src/
    ├── api/                 # API service clients & HTTP abstractions
    │   ├── client.ts
    │   └── puzzleService.ts
    ├── components/          # Reusable UI components
    │   ├── Button.tsx
    │   ├── Footer.tsx
    │   ├── LanguageSwitcher.tsx
    │   ├── Navbar.tsx
    │   └── PuzzleBoard.tsx
    ├── layouts/             # Page layout wrappers
    │   └── MainLayout.tsx
    ├── model/               # TypeScript data models & interfaces
    │   ├── api.ts
    │   ├── locale.ts
    │   └── puzzle.ts
    ├── pages/               # Next.js Pages router
    │   ├── _app.tsx
    │   ├── _document.tsx
    │   ├── 404.tsx          # Custom 404 Not Found
    │   ├── 500.tsx          # Custom 500 Server Error
    │   ├── index.tsx        # Homepage
    │   └── api/
    │       └── health.ts
    ├── routers/             # Route path definitions & helpers
    │   └── routes.ts
    ├── styles/              # Global styles & Tailwind
    │   └── globals.css
    ├── utils/               # Utility functions & helpers
    │   ├── cn.ts
    │   ├── i18n.tsx         # i18n Provider & useTranslation hook
    │   └── storage.ts
    └── view/                # Page view/screen containers
        ├── Error404View.tsx
        ├── Error500View.tsx
        └── HomeView.tsx
```

---

## 🚀 Getting Started with Yarn

### 1. Install Dependencies
```bash
yarn install
```

### 2. Run Local Development (using `.env.dev`)
```bash
yarn dev
```
The app will be available at [http://localhost:3000](http://localhost:3000).

### 3. Build for Development / Production
```bash
# Build using .env.dev
yarn build:dev

# Build using .env.prod
yarn build:prod
# or standard:
yarn build
```

### 4. Run Production Server (using `.env.prod`)
```bash
yarn start
```

### 5. Type Checking & Linting
```bash
yarn type-check
yarn lint
```

---

## 🌍 Supported Languages (13 Locales)
- 🇺🇸 **English** (`en`)
- 🇩🇪 **German** (`de`)
- 🇪🇸 **Spanish** (`es`)
- 🇵🇭 **Filipino** (`fil`)
- 🇫🇷 **French** (`fr`)
- 🇮🇳 **Hindi** (`hi`)
- 🇮🇹 **Italian** (`it`)
- 🇰🇷 **Korean** (`ko`)
- 🇲🇾 **Malay** (`ms`)
- 🇵🇹 **Portuguese** (`pt`)
- 🇷🇺 **Russian** (`ru`)
- 🇹🇭 **Thai** (`th`)
- 🇺🇦 **Ukrainian** (`uk`)
