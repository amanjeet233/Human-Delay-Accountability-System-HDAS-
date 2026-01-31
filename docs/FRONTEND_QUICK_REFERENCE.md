# Frontend Quick Reference Card

**HDAS Frontend Architecture** | Next.js 14.2 | React 18 | TypeScript | Tailwind CSS

---

## 📁 Folder Structure

```
frontend/
├── app/                          # Next.js app directory
│   ├── login/page.tsx           # Public: Login page
│   ├── register/page.tsx         # Public: Register page
│   ├── admin/                    # ADMIN role routes
│   ├── auditor/                  # AUDITOR role routes
│   ├── hod/                      # HOD role routes
│   ├── clerk/                    # CLERK role routes
│   ├── citizen/                  # CITIZEN role routes
│   ├── section-officer/          # Redirects to /so
│   ├── so/                       # SECTION_OFFICER main routes
│   └── [other pages]
├── components/
│   ├── layout/
│   │   ├── BaseLayout.tsx        # ⭐ Reusable base layout
│   │   ├── AdminLayout.tsx
│   │   ├── CitizenLayout.tsx
│   │   └── [role]Layout.tsx
│   ├── RoleGuard.tsx            # ⭐ Route protection wrapper
│   ├── Toast.tsx                # Error/success notifications
│   └── [other components]
├── lib/
│   ├── apiClient.ts             # ⭐ Single API client instance
│   ├── api.ts                   # API wrapper & interfaces
│   ├── authContext.tsx          # ⭐ Auth state management
│   ├── roleAccess.ts            # Role access patterns
│   └── hooks/
│       └── useApi.ts            # API hook pattern
└── [config files: tsconfig, tailwind, next.config]
```

---

## 🔐 Authentication & Authorization

### Using Auth
```typescript
import { useAuth } from '@/lib'

const { user, isAuthenticated, isLoading, login, logout } = useAuth()
// user = { id, username, email, role }
// Roles: ADMIN, AUDITOR, HOD, CLERK, CITIZEN, SECTION_OFFICER
```

### Protecting Routes
```typescript
<RoleGuard allowedRoles={["ADMIN"]}>
  <AdminDashboard />
</RoleGuard>
```

### Login Flow
```
User → Login Page → useAuth.login() → redirectToDashboard() → Role Dashboard
```

---

## 🌐 API Usage

### Basic Pattern
```typescript
import api from '@/lib/api'

// GET
const response = await api.get('/requests')
const data = response.data

// POST
await api.post('/requests', { title: 'New Request', ... })

// PUT
await api.put('/requests/123', { status: 'COMPLETED' })

// DELETE
await api.delete('/requests/123')
```

### Error Handling
```typescript
try {
  const response = await api.get('/requests')
  setData(response.data)
} catch (error) {
  console.error('Failed to load:', error)
  // Consider: Show toast notification
}
```

### Single API Instance
```typescript
// All pages use same client with centralized auth
// No need to manage tokens manually
// Interceptors handle auth headers automatically
```

---

## 🎨 Layout Usage

### With BaseLayout
```typescript
'use client'

import BaseLayout from '@/components/layout/BaseLayout'

export default function MyPage({ userId, userName, currentPage }) {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: <HomeIcon /> },
    { name: 'Items', href: '/items', icon: <ListIcon /> },
  ]

  return (
    <BaseLayout
      userId={userId}
      userName={userName}
      currentPage={currentPage}
      navigation={navigation}
      roleLabel="CustomRole"
      roleColor="blue"      // blue | amber | emerald | purple | rose
      backgroundGradient="from-slate-50 to-blue-50"
      children={/* Page Content */}
    />
  )
}
```

### Available Role Colors
- `blue` - Admin (slate)
- `amber` - Clerk (warm)
- `emerald` - HOD (green)
- `purple` - Custom roles
- `rose` - Alternative custom

---

## 📋 Creating a New Page

### 1. Create Page File
```typescript
// app/admin/new-feature/page.tsx
'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import api from '@/lib/api'

export default function NewFeaturePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await api.get('/endpoint')
      setData(response.data)
    } catch (error) {
      console.error('Failed to load:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout
      userId="ADMIN-001"
      userName="Admin Name"
      currentPage="New Feature"
    >
      {/* Page Content */}
    </AdminLayout>
  )
}
```

### 2. Add to Navigation
```typescript
const adminNavigation = [
  { name: 'New Feature', href: '/admin/new-feature', icon: NewIcon },
]
```

### 3. Protect if Needed
```typescript
// Wrap content or use layout (layouts already protected)
<RoleGuard allowedRoles={["ADMIN"]}>
  {/* Admin-only content */}
</RoleGuard>
```

---

## 🧩 Common Components

### RoleGuard
```typescript
<RoleGuard allowedRoles={["ADMIN", "HOD"]}>
  {/* Shown only to ADMIN and HOD */}
</RoleGuard>
```

### useAuth Hook
```typescript
const { user, isAuthenticated, isLoading } = useAuth()

if (isLoading) return <LoadingSpinner />
if (!isAuthenticated) return <LoginPrompt />
return <Dashboard user={user} />
```

### Toast Notifications
```typescript
import { Toast } from '@/components'

const [notification, setNotification] = useState(null)

const showToast = (message, type = 'info') => {
  setNotification({ message, type })
}

return (
  <>
    {/* Your content */}
    {notification && (
      <Toast
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(null)}
      />
    )}
  </>
)
```

---

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Requests (Citizen)
- `GET /api/requests` - List user's requests
- `POST /api/requests` - Create request
- `GET /api/requests/:id` - Get request details
- `PUT /api/requests/:id` - Update request

### Admin
- `GET /api/users` - List users
- `GET /api/processes` - List processes
- `GET /api/escalations` - List escalations

---

## ⚙️ Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### TypeScript Aliases
```typescript
@/lib          // Import from lib/
@/components   // Import from components/
```

---

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev        # http://localhost:3000

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check
```

---

## 📊 Role Matrix

| Role | Dashboard | Create | Approve | Admin | Analytics |
|------|-----------|--------|---------|-------|-----------|
| ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ |
| AUDITOR | ✅ | ❌ | ❌ | ❌ | ✅ |
| HOD | ✅ | ✅ | ✅ | ❌ | ✅ |
| CLERK | ✅ | ✅ | ✅ | ❌ | ❌ |
| CITIZEN | ✅ | ✅ | ❌ | ❌ | ❌ |
| SECTION_OFFICER | ✅ | ❌ | ✅ | ❌ | ❌ |

---

## ✅ Checklist for New Features

- [ ] Create page file in correct role directory
- [ ] Wrap with appropriate layout component
- [ ] Add TypeScript interfaces for data
- [ ] Implement useEffect for data loading
- [ ] Add error handling (try-catch)
- [ ] Add loading state
- [ ] Use RoleGuard if additional protection needed
- [ ] Test with correct role
- [ ] Test with incorrect role (should redirect)
- [ ] Add to navigation menu

---

## 🐛 Debugging Tips

### Check Auth State
```typescript
const { user, isAuthenticated, isLoading } = useAuth()
console.log('User:', user)
console.log('Authenticated:', isAuthenticated)
console.log('Loading:', isLoading)
```

### Check API Response
```typescript
try {
  const response = await api.get('/endpoint')
  console.log('Response:', response)
  console.log('Data:', response.data)
} catch (error) {
  console.error('Error:', error)
  console.error('Status:', error.status)
  console.error('Data:', error.data)
}
```

### Check Role
```typescript
const { user } = useAuth()
console.log('Current Role:', user?.role)
console.log('Can access ADMIN:', user?.role === 'ADMIN')
```

---

## 🎯 Key Takeaways

1. **Single API Client** - Use `api` from `@/lib/api` everywhere
2. **Centralized Auth** - Use `useAuth()` hook for user state
3. **Consistent Layouts** - Use `BaseLayout` for all roles
4. **Proper Protection** - Wrap sensitive routes with `RoleGuard`
5. **Error Handling** - Always use try-catch for API calls
6. **Loading States** - Show spinners while loading data
7. **TypeScript** - Define interfaces for all data structures
8. **Clean Code** - Follow folder structure and naming conventions

---

**Updated:** Current Session  
**Version:** 2.0 (Post-Consolidation)  
**Status:** Production Ready
