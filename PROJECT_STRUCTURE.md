# YUSCO Shop - Project Structure

## 📁 Directory Organization

```
src/
├── api/                          # API layer - all backend communication
│   ├── client.ts                 # Base HTTP client with interceptors
│   ├── auth.api.ts               # Authentication API endpoints
│   └── index.ts                  # Barrel file for API exports
│
├── components/                   # React components
│   ├── ui/                       # Shadcn UI components
│   ├── layout/                   # Layout components (Sidebar, Navbar, etc.)
│   │   ├── AppLayout.tsx
│   │   ├── AppSidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── NavLink.tsx
│   ├── forms/                    # Form components
│   │   ├── AddProductDialog.tsx
│   │   ├── AddShopDialog.tsx
│   │   ├── AddServiceSaleDialog.tsx
│   │   └── RecordSaleDialog.tsx
│   └── dashboard/                # Dashboard specific components
│       └── StatCard.tsx
│
├── config/                       # Application configuration
│   ├── api.config.ts             # API URLs and endpoints
│   └── app.config.ts             # General app configuration
│
├── constants/                    # Application constants
│   ├── roles.ts                  # User roles and permissions
│   ├── shop-types.ts             # Shop types and status
│   └── index.ts                  # Barrel file for constants
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── pages/                        # Page components (routes)
│   ├── Index.tsx                 # Dashboard
│   ├── ShopsPage.tsx
│   ├── InventoryPage.tsx
│   ├── SalesPage.tsx
│   ├── ServicesPage.tsx
│   ├── ReportsPage.tsx
│   ├── NotificationsPage.tsx
│   ├── SettingsPage.tsx
│   ├── NotFound.tsx
│   └── LoginPage.tsx
│
├── services/                     # Business logic services
│   └── (to be added)
│
├── store/                        # State management (Zustand)
│   └── useStore.ts
│
├── styles/                       # Global styles
│   ├── App.css
│   └── index.css
│
├── types/                        # TypeScript type definitions
│   └── models.ts
│
├── utils/                        # Utility functions
│   └── helpers/                  # Helper functions organized by concern
│       ├── auth.helper.ts        # Authentication helpers
│       ├── storage.helper.ts     # LocalStorage helpers
│       ├── format.helper.ts      # Formatting helpers
│       └── index.ts              # Barrel file
│
├── data/                         # Mock data for development
│   └── mockData.ts
│
├── test/                         # Test files
│   ├── example.test.ts
│   └── setup.ts
│
├── App.tsx                       # Root component
├── main.tsx                      # Entry point
└── vite-env.d.ts                 # Vite environment types

```

## 🏗️ Architecture Layers

### 1. **API Layer** (`/api`)
- Centralized HTTP client
- API endpoint definitions
- API service functions
- Response type definitions

### 2. **Configuration Layer** (`/config`)
- API configuration
- App-wide settings
- Environment variables
- Constants that don't change frequently

### 3. **Constants Layer** (`/constants`)
- Enums and constant values
- Role definitions
- Shop types
- Status definitions

### 4. **Component Layer** (`/components`)
- Presentational components
- Layout components
- Form components
- UI component wrappers

### 5. **Page Layer** (`/pages`)
- Route-level components
- Connected to store and APIs
- Business logic composition

### 6. **Utils & Helpers** (`/utils`)
- Reusable utility functions
- Helper functions for common tasks
- Formatting, storage, auth helpers

### 7. **State Management** (`/store`)
- Zustand store
- Global application state

## 🔄 Data Flow

```
User Interaction (Component)
         ↓
    Event Handler
         ↓
    API Call (via authApi/shopApi/etc)
         ↓
    API Client (with auth headers)
         ↓
    Backend API
         ↓
    Response
         ↓
    State Update (Store/useState)
         ↓
    Re-render Component
```

## 📤 Importing Best Practices

### ✅ Correct Import Order
```typescript
// 1. External packages
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 2. Config
import { API_CONFIG } from "@/config/api.config";

// 3. UI Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// 4. API & Services
import { authApi } from "@/api/auth.api";
import { authHelper } from "@/utils/helpers/auth.helper";

// 5. Types
import type { User } from "@/types/models";

// 6. Styles
import "./MyComponent.css";
```

### 🔌 Using API Services
```typescript
// Instead of direct fetch calls:
const response = await authApi.login({ email, password });

// Instead of inline localStorage:
authHelper.setToken(token);
authHelper.getUser();
```

## 🔐 Authentication Flow

1. User enters credentials → LoginPage.tsx
2. Calls `authApi.login()` from `/api/auth.api.ts`
3. API Client adds auth headers
4. Backend returns token + user
5. Save with `authHelper.setToken()` and `authHelper.setUser()`
6. Navigate to dashboard
7. ProtectedRoute checks token existence

## 📦 Adding New Features

### Example: Adding a Shop API
```typescript
// 1. Create /api/shop.api.ts
export const shopApi = {
  list: () => apiClient.get(API_ENDPOINTS.SHOPS.LIST),
  getById: (id: string) => apiClient.get(API_ENDPOINTS.SHOPS.GET(id)),
  create: (data) => apiClient.post(API_ENDPOINTS.SHOPS.CREATE, data),
  update: (id, data) => apiClient.put(API_ENDPOINTS.SHOPS.UPDATE(id), data),
  delete: (id) => apiClient.delete(API_ENDPOINTS.SHOPS.DELETE(id)),
};

// 2. Export from /api/index.ts
export * from "./shop.api";

// 3. Use in components
import { shopApi } from "@/api";
const shops = await shopApi.list();
```

## 🎯 Benefits of This Structure

- **Scalability**: Easy to add new features
- **Maintainability**: Clear separation of concerns
- **Reusability**: Shared helpers and API functions
- **Testability**: Isolated modules for unit testing
- **Performance**: Lazy loaded routes, optimized imports
- **Type Safety**: TypeScript throughout
- **Consistency**: Standardized patterns across codebase

## 🚀 Build & Deploy

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview

# Test
npm run test
```
