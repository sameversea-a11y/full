# Fusion Starter

A production-ready React SPA application template featuring React Router 6, TypeScript, Vitest, Zod and modern tooling. Designed to work with external API servers.

## Tech Stack

- **PNPM**: Prefer pnpm
- **Frontend**: React 18 + React Router 6 (SPA) + TypeScript + Vite + TailwindCSS 3
- **Backend**: External API server (not included)
- **Testing**: Vitest
- **UI**: Radix UI + TailwindCSS 3 + Lucide React icons

## Project Structure

```
client/                   # React SPA frontend
├── pages/                # Route components (Index.tsx = home)
├── components/ui/        # Pre-built UI component library
├── contexts/             # React contexts for state management
├── api/                  # API integration layer
├── App.tsx                # App entry point and with SPA routing setup
└── global.css            # TailwindCSS 3 theming and global styles

shared/                   # Types used by both client & server
├── api.ts                # API interfaces
└── pricing.ts            # Pricing logic and types
```

## Key Features

### External API Integration

The application is designed to work with external API servers:

- **API Layer**: Centralized API calls in `client/api/api.tsx`
- **Authentication**: Token-based auth with automatic token management
- **Error Handling**: Comprehensive error handling with user feedback
- **File Uploads**: Robust file upload with progress tracking
- **Environment Config**: API URLs configured via environment variables

## SPA Routing System

The routing system is powered by React Router 6:

- `client/pages/Index.tsx` represents the home page.
- Routes are defined in `client/App.tsx` using the `react-router-dom` import
- Route files are located in the `client/pages/` directory

For example, routes can be defined with:

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";

<Routes>
  <Route path="/" element={<Index />} />
  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
  <Route path="*" element={<NotFound />} />
</Routes>;
```

### State Management

- **React Context**: Used for global state management
- **Document Context**: Manages file uploads and document state
- **Pricing Context**: Handles pricing calculations
- **Payment Context**: Manages payment flow and Razorpay integration

### Styling System

- **Primary**: TailwindCSS 3 utility classes
- **Theme and design tokens**: Configure in `client/global.css` 
- **UI components**: Pre-built library in `client/components/ui/`
- **Utility**: `cn()` function combines `clsx` + `tailwind-merge` for conditional classes

```typescript
// cn utility usage
className={cn(
  "base-classes",
  { "conditional-class": condition },
  props.className  // User overrides
)}
```

### Shared Types
Import consistent types across the application:
```typescript
import { DocumentType, PricingTier } from '@shared/pricing';
```

Path aliases:
- `@shared/*` - Shared folder
- `@/*` - Client folder

## Development Commands

```bash
pnpm dev        # Start dev server (client only)
pnpm build      # Production build
pnpm preview    # Preview production build
pnpm typecheck  # TypeScript validation
pnpm test       # Run Vitest tests
```

## Adding Features

### Add new colors to the theme

Open `client/global.css` and `tailwind.config.ts` and add new tailwind colors.

### New API Integration
1. **Add API function** in `client/api/api.tsx`:
```typescript
export const getMyData = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/api/my-endpoint/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to get data");
  }
};
```

### New Page Route
1. Create component in `client/pages/MyPage.tsx`
2. Add route in `client/App.tsx`:
```typescript
<Route path="/my-page" element={<MyPage />} />
```

### Environment Variables

Configure your external API in `.env`:
```bash
VITE_API_BASE_URL=https://your-api-server.com
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_here
```

## Production Deployment

- **Build**: `pnpm build` - Creates optimized SPA build
- **Preview**: `pnpm preview` - Test production build locally
- **Deploy**: Use Netlify, Vercel, or any static hosting provider

## Architecture Notes

- Pure frontend SPA with external API integration
- TypeScript throughout (client, server, shared)
- Hot reload for rapid development
- Production-ready static build
- Comprehensive UI component library included
- Robust error handling and loading states
- File upload with progress tracking
- Payment integration with Razorpay
- IndexedDB for local file storage
