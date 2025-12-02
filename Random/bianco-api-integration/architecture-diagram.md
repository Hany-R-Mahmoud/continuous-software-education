# Bianco API Integration - Architecture Diagrams

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Mobile App (Expo/React Native)            │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    UI Layer (Screens)                       │ │
│  │  LoginScreen  │  HomeScreen  │  CardsScreen  │  ProfileScreen │ │
│  └───────────────┬──────────────────────────────────────────┘ │
│                  │                                               │
│                  ↓                                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                Feature API Layer                            │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │ │
│  │  │   Auth API  │  │  Cards API  │  │ Profile API │       │ │
│  │  │             │  │             │  │             │       │ │
│  │  │ • Queries   │  │ • Queries   │  │ • Queries   │       │ │
│  │  │ • Services  │  │ • Services  │  │ • Services  │       │ │
│  │  │ • Types     │  │ • Types     │  │ • Types     │       │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │ │
│  └───────────────────────┬────────────────────────────────────┘ │
│                          │                                       │
│                          ↓                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              React Query Layer                              │ │
│  │  • Caching                                                  │ │
│  │  • Request Deduplication                                    │ │
│  │  • Automatic Refetching                                     │ │
│  │  • Loading/Error States                                     │ │
│  └───────────────────────┬────────────────────────────────────┘ │
│                          │                                       │
│                          ↓                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              API Client (Axios)                             │ │
│  │                                                             │ │
│  │  Request Interceptor:                                       │ │
│  │    → Inject Bearer Token                                    │ │
│  │    → Add Headers                                            │ │
│  │    → Log Requests (if enabled)                              │ │
│  │                                                             │ │
│  │  Response Interceptor:                                      │ │
│  │    ← Handle 401 (Auto Logout)                               │ │
│  │    ← Handle Errors                                          │ │
│  │    ← Log Responses (if enabled)                             │ │
│  └───────────────────────┬────────────────────────────────────┘ │
│                          │                                       │
│                          ↓                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           Token Store + Session Management                  │ │
│  │  • Token Storage (AsyncStorage)                             │ │
│  │  • Token Sync (React ↔ Interceptors)                        │ │
│  │  • Session State (isAuthenticated, userId)                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└──────────────────────────┬────────────────────────────────────┘
                           │ HTTPS
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API Server                          │
│  • Authentication Endpoints                                      │
│  • Business Logic                                                │
│  • Database                                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Feature API Structure (Detail)

```
features/auth/api/
│
├── index.ts                          # Main export file
│   export * from './queries';
│   export * from './services';
│   export * from './types';
│
├── types/
│   ├── index.ts                      # Type exports
│   │   export * from './auth.types';
│   │
│   └── auth.types.ts                 # Type definitions
│       export type LoginParams = {...}
│       export type LoginResponse = {...}
│
├── services/
│   └── index.ts                      # API call functions
│       export const authServices = {
│         login: async (params) => apiClient.post(...),
│         logout: async () => apiClient.post(...),
│       };
│
└── queries/
    ├── index.ts                      # Query exports
    │   export { useLoginMutation } from './use-login-mutation';
    │
    └── use-login-mutation.ts         # React Query hook
        export const useLoginMutation = () =>
          useMutation({
            mutationFn: authServices.login,
            ...
          });
```

## Data Flow: Login Request

```
┌────────────────┐
│  LoginScreen   │
│                │
│  1. User       │
│     enters     │
│     credentials│
└───────┬────────┘
        │
        │ login({ username, password })
        ↓
┌────────────────────────┐
│  useLoginMutation      │
│  (React Query)         │
│                        │
│  2. Trigger mutation   │
└───────┬────────────────┘
        │
        │ authServices.login(params)
        ↓
┌────────────────────────┐
│  authServices.login    │
│  (Service Function)    │
│                        │
│  3. Call API           │
└───────┬────────────────┘
        │
        │ apiClient.post('/auth/login', params)
        ↓
┌────────────────────────┐
│  API Client            │
│  (Axios Instance)      │
│                        │
│  4. Request            │
│     Interceptor        │
│     • Add headers      │
│     • Log request      │
└───────┬────────────────┘
        │
        │ HTTP POST
        ↓
┌────────────────────────┐
│  Backend API           │
│                        │
│  5. Process request    │
│  6. Return response    │
└───────┬────────────────┘
        │
        │ { access_token, user }
        ↓
┌────────────────────────┐
│  API Client            │
│                        │
│  7. Response           │
│     Interceptor        │
│     • Handle errors    │
│     • Log response     │
└───────┬────────────────┘
        │
        │ return response.data
        ↓
┌────────────────────────┐
│  useLoginMutation      │
│                        │
│  8. onSuccess          │
│     callback           │
└───────┬────────────────┘
        │
        │ setToken(data.access_token)
        │ setIsAuthenticated(true)
        ↓
┌────────────────────────┐
│  Session Context       │
│                        │
│  9. Update state       │
│  10. Persist token     │
│  11. Sync token store  │
└───────┬────────────────┘
        │
        │ router.replace('/home')
        ↓
┌────────────────────────┐
│  Home Screen           │
│                        │
│  12. User logged in    │
└────────────────────────┘
```

## Error Flow: 401 Unauthorized

```
┌────────────────┐
│  Any Screen    │
│  (Authenticated)│
└───────┬────────┘
        │
        │ API Request (with expired token)
        ↓
┌────────────────────────┐
│  Backend API           │
│                        │
│  Returns 401           │
└───────┬────────────────┘
        │
        │ 401 Response
        ↓
┌────────────────────────┐
│  Response Interceptor  │
│                        │
│  1. Detect 401         │
│  2. Check token exists │
└───────┬────────────────┘
        │
        │ handleUnauthorizedError()
        ↓
┌────────────────────────┐
│  401 Handler           │
│                        │
│  3. Set flag to        │
│     prevent concurrent │
│     handlers           │
└───────┬────────────────┘
        │
        │ tokenStore.clearToken()
        ↓
┌────────────────────────┐
│  Token Store           │
│                        │
│  4. Clear token cache  │
└───────┬────────────────┘
        │
        │ sessionStore.clearSession()
        ↓
┌────────────────────────┐
│  Session Context       │
│                        │
│  5. Clear:             │
│     • token            │
│     • isAuthenticated  │
│     • userId           │
└───────┬────────────────┘
        │
        │ navigationQueue.enqueue()
        ↓
┌────────────────────────┐
│  Navigation Queue      │
│                        │
│  6. Queue navigation   │
│     (prevents races)   │
└───────┬────────────────┘
        │
        │ router.replace('/login')
        ↓
┌────────────────────────┐
│  Login Screen          │
│                        │
│  7. Show alert:        │
│     "Session Expired"  │
└────────────────────────┘
```

## Token Sync Pattern

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │  Session Context │◄───────►│   Token Store    │     │
│  │  (React State)   │  sync   │   (Module-level) │     │
│  └────────┬─────────┘         └────────┬─────────┘     │
│           │                             │               │
│           │                             │               │
│           │ setToken()                  │ getToken()    │
│           │                             │               │
│           ↓                             ↓               │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │  AsyncStorage    │         │   Axios          │     │
│  │  (Persistence)   │         │   Interceptor    │     │
│  └──────────────────┘         └──────────────────┘     │
│                                                          │
└─────────────────────────────────────────────────────────┘

Flow:
1. User logs in → token received
2. Session Context: setToken(token)
   → Updates React state
   → Syncs to Token Store
   → Persists to AsyncStorage
3. Next API call:
   → Interceptor reads from Token Store
   → Adds to Authorization header
   → Request sent with token
```

## Provider Hierarchy

```
┌─────────────────────────────────────────┐
│       App Entry Point (_layout.tsx)      │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│          AppProviders                    │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │      TamaguiProvider               │ │
│  │      (Theme + Styling)             │ │
│  │                                    │ │
│  │  ┌──────────────────────────────┐ │ │
│  │  │   SessionProvider            │ │ │
│  │  │   (Auth + Token State)       │ │ │
│  │  │                              │ │ │
│  │  │  ┌────────────────────────┐ │ │ │
│  │  │  │  QueryProvider         │ │ │ │
│  │  │  │  (React Query)         │ │ │ │
│  │  │  │                        │ │ │ │
│  │  │  │  ┌──────────────────┐ │ │ │ │
│  │  │  │  │   MainLayout     │ │ │ │ │
│  │  │  │  │                  │ │ │ │ │
│  │  │  │  │  ┌────────────┐ │ │ │ │ │
│  │  │  │  │  │   Routes   │ │ │ │ │ │
│  │  │  │  │  │  (Screens) │ │ │ │ │ │
│  │  │  │  │  └────────────┘ │ │ │ │ │
│  │  │  │  └──────────────────┘ │ │ │ │
│  │  │  └────────────────────────┘ │ │ │
│  │  └──────────────────────────────┘ │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘

Provider Order Matters!
→ Inner providers can access outer provider context
→ Outer providers cannot access inner provider context
```

## Directory Structure (Complete)

```
apps/app-client/
│
├── config/
│   └── env.ts                    # Environment configuration
│
├── lib/
│   └── api/
│       ├── apiClient.ts          # Axios instance + interceptors
│       └── types.ts              # Shared API types
│
├── providers/
│   ├── index.tsx                 # AppProviders (composition)
│   ├── query-provider.tsx        # React Query setup
│   └── session-provider.tsx      # Session wrapper
│
├── layouts/
│   └── main-layout.tsx           # Main app layout
│
├── hooks/
│   └── use-session/
│       └── index.tsx             # Session context + hook
│
├── features/
│   └── auth/
│       ├── api/
│       │   ├── index.ts          # Main export
│       │   ├── types/
│       │   │   ├── index.ts
│       │   │   └── auth.types.ts
│       │   ├── services/
│       │   │   └── index.ts
│       │   └── queries/
│       │       ├── index.ts
│       │       ├── use-login-mutation.ts
│       │       └── use-logout-mutation.ts
│       └── screens/
│           └── login/
│               ├── index.tsx     # LoginScreen component
│               └── style.ts      # Styles
│
└── app/
    └── (non-protected)/
        └── login/
            └── index.tsx         # Route file (minimal)
```

---

These diagrams show the complete architecture from top to bottom, illustrating how all pieces fit together in the Bianco API integration.
