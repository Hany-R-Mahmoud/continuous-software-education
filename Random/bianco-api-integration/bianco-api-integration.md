# Bianco API Integration - A Production-Ready Approach

## Overview

This document explores the complete API integration architecture implemented in the Bianco project - a React Native/Expo mobile banking application. The integration demonstrates best practices for building scalable, maintainable API layers in modern mobile applications.

## Context

**Project:** Bianco - Mobile Banking App  
**Tech Stack:** React Native 0.79, Expo 53, TypeScript 5.8  
**Challenge:** Integrate API layer from scratch with proper architecture  
**Outcome:** Production-ready API foundation with 20+ files and 800+ LOC

## Architecture Overview

### The Problem

When building mobile apps, common API integration challenges include:

1. **Token Management** - Storing and injecting auth tokens
2. **Error Handling** - Global error handling (401s, network errors)
3. **State Management** - Caching, loading states, error states
4. **Code Organization** - Where to put API code as app grows
5. **Type Safety** - Ensuring type safety across API boundaries

### The Solution: Layered Architecture

```
┌─────────────────────────────────────────────┐
│         UI Components (Screens)              │
│  - Login Screen, Home Screen, etc.          │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│      Feature API Layer (React Query)         │
│  ┌──────────────┐    ┌──────────────┐       │
│  │   Queries    │    │   Services   │       │
│  │ (useLogin)   │    │ (authServices)│      │
│  └──────────────┘    └──────────────┘       │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│        API Client (Axios + Interceptors)     │
│  - Token Injection                           │
│  - 401 Handling                              │
│  - Request/Response Logging                  │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│             Backend API                      │
└─────────────────────────────────────────────┘
```

## Key Concepts

### 1. Feature-Based API Organization

Instead of grouping by type (all services together, all hooks together), group by feature:

```
features/
├── auth/
│   └── api/
│       ├── types/          # Auth-specific types
│       ├── services/       # API call functions
│       └── queries/        # React Query hooks
└── cards/
    └── api/
        ├── types/
        ├── services/
        └── queries/
```

**Benefits:**
- Related code stays together
- Easy to find feature-specific logic
- Scales well as app grows
- Team members can work on features independently

### 2. Service/Query Separation

**Services** - Pure API functions (no React dependencies):
```typescript
// services/index.ts
export const authServices = {
  login: async (params: LoginParams) => {
    const response = await apiClient.post('/auth/login', params);
    return response.data;
  }
};
```

**Queries** - React Query wrappers:
```typescript
// queries/use-login-mutation.ts
export const useLoginMutation = ({ onSuccess, onError }) =>
  useMutation({
    mutationFn: authServices.login,
    onSuccess,
    onError
  });
```

**Why separate?**
- Services can be tested without React
- Services can be reused outside React (e.g., in utilities)
- Clear separation of concerns

### 3. Axios Interceptors for Cross-Cutting Concerns

**Request Interceptor** - Add token to all requests:
```typescript
apiClient.interceptors.request.use((config) => {
  const token = tokenStore.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Response Interceptor** - Handle 401 globally:
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);
```

**Benefits:**
- Write token logic once, works everywhere
- Automatic 401 handling
- Easy to add logging, retry logic, etc.

### 4. Token Store Pattern

**Problem:** Axios interceptors run outside React component tree, can't use hooks.

**Solution:** Module-level token store that syncs with React state:

```typescript
// Token store (outside React)
const createTokenStore = () => {
  let token: string | null = null;
  
  return {
    getToken: () => token,
    setToken: (newToken) => { token = newToken; }
  };
};

export const tokenStore = createTokenStore();

// In Session Context (React)
const setToken = async (token: string) => {
  setTokenState(token);           // Update React state
  tokenStore.setToken(token);     // Sync with token store
  await AsyncStorage.setItem('token', token); // Persist
};
```

**Benefits:**
- Interceptors can access token
- React components can update token
- Single source of truth with sync

### 5. React Query for Data Management

Instead of managing loading/error states manually:

```typescript
// Without React Query
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  fetch('/api/cards')
    .then(res => setData(res))
    .catch(err => setError(err))
    .finally(() => setLoading(false));
}, []);
```

**With React Query:**
```typescript
const { data, isLoading, error } = useGetCardsQuery();
```

**Benefits:**
- Automatic caching
- Automatic refetching
- Request deduplication
- Built-in loading/error states
- Much less boilerplate

## Implementation Details

### Environment Configuration

**Challenge:** Store API URL, timeouts, feature flags without hardcoding.

**Solution:** Type-safe environment configuration with Expo Constants:

```typescript
// config/env.ts
const env = {
  API_URL: getEnvVar('API_URL', 'http://localhost:3000'),
  API_TIMEOUT: getEnvNumber('API_TIMEOUT', 30000),
  ENABLE_API_LOGGING: getEnvVar('ENABLE_API_LOGGING', 'false') === 'true',
} as const;

export default env;
```

**Sources (priority order):**
1. `app.json` extra field (for production builds)
2. `.env` files (for local development)
3. Default values (fallback)

### Session Management Integration

**Challenge:** Integrate token management with existing session/auth state.

**Solution:** Extend session context with token state:

```typescript
const SessionContext = createContext({
  token: string | null,
  setToken: (token) => Promise<void>,
  isAuthenticated: boolean,
  // ... other session fields
});
```

**Features:**
- Token persisted to AsyncStorage
- Token synced with tokenStore for interceptors
- Automatic logout on 401
- Callback system for external access

### 401 Error Handling Flow

1. **API returns 401** → Response interceptor catches it
2. **Clear token** → Remove from store and session
3. **Clear session** → Reset auth state, user data
4. **Navigate to login** → Using navigation queue (prevents race conditions)
5. **Show alert** → "Session Expired" message

**Race Condition Prevention:**
```typescript
// Navigation queue ensures one 401 handler at a time
const navigationQueue = createNavigationQueue();

async function handle401() {
  await navigationQueue.enqueue(async () => {
    router.replace('/login');
  });
}
```

### Screen Refactoring Pattern

**Before:** Screen logic mixed with route files
```
app/
└── (non-protected)/
    └── login/
        └── index.tsx  (162 lines - all logic here)
```

**After:** Route file delegates to feature screen
```
app/(non-protected)/login/index.tsx:
  import LoginScreen from '@/features/auth/screens/login';
  export default () => <LoginScreen />;

features/auth/screens/login/index.tsx:
  // Full screen implementation (192 lines)
```

**Benefits:**
- Route files stay minimal
- Screen logic organized by feature
- Easier to find and maintain code
- Better separation of concerns

## Real-World Example: Login Integration

### Before (Mock)
```typescript
const handleLogin = async () => {
  await setIsAuthenticated(true);
  await setCurrentUserId('1');
  router.replace('/home');
};
```

### After (Real API)
```typescript
const { mutate: login, isPending } = useLoginMutation({
  onSuccess: async (data) => {
    await setToken(data.access_token);
    await setIsAuthenticated(true);
    if (data.user?.id) await setCurrentUserId(data.user.id);
    router.replace('/home');
  },
  onError: (error) => {
    Alert.alert('Login Failed', error.response?.data?.message);
  },
});

const handleLogin = async () => {
  if (await formRef.current?.submit()) {
    const formData = formRef.current?.getValues();
    login({ 
      username: formData.username, 
      password: formData.password 
    });
  }
};
```

**Improvements:**
- Real API call with loading state
- Type-safe params and response
- Error handling with user feedback
- Token management
- User data from API response

## Lessons Learned

### 1. Start with Architecture

Don't add API calls one-by-one without planning. Design the architecture first:
- Where will API code live?
- How will tokens be managed?
- How will errors be handled?
- How will data be cached?

### 2. Separation of Concerns

Keep layers separate:
- **UI Layer** (Components) - Display data, handle user interactions
- **Query Layer** (React Query hooks) - Manage React-specific data fetching
- **Service Layer** (API functions) - Pure API calls, no React
- **Client Layer** (Axios) - HTTP client with interceptors

### 3. Type Safety Throughout

Define types at every boundary:
```typescript
// Request types
type LoginParams = { username: string; password: string };

// Response types
type LoginResponse = { access_token: string; user: {...} };

// Error types
type ErrorType = AxiosError<APIError>;

// Service signature
login: (params: LoginParams) => Promise<LoginResponse>
```

### 4. Handle Errors Globally

Don't repeat error handling in every component:
- Use interceptors for auth errors (401)
- Use React Query callbacks for feature-specific errors
- Use error boundaries for unexpected errors

### 5. Plan for Scale

The architecture should support:
- Adding new features easily
- Multiple developers working simultaneously
- Growing codebase without chaos
- Refactoring without breaking everything

## Common Pitfalls

### ❌ Don't: Access API Client Directly in Components
```typescript
// Bad
const LoginScreen = () => {
  const handleLogin = async () => {
    const response = await apiClient.post('/login', data);
  };
};
```

### ✅ Do: Use Feature-Specific Hooks
```typescript
// Good
const LoginScreen = () => {
  const { mutate: login } = useLoginMutation();
  const handleLogin = () => login(data);
};
```

### ❌ Don't: Store Token in Component State
```typescript
// Bad
const [token, setToken] = useState(null);
```

### ✅ Do: Store in Session Context with Persistence
```typescript
// Good
const { token, setToken } = useSession(); // Persisted + synced
```

### ❌ Don't: Ignore Loading States
```typescript
// Bad - user has no feedback
<Button onPress={handleLogin}>Login</Button>
```

### ✅ Do: Show Loading State
```typescript
// Good
const { mutate: login, isPending } = useLoginMutation();
<Button onPress={handleLogin} disabled={isPending}>
  {isPending ? 'Logging in...' : 'Login'}
</Button>
```

## Performance Considerations

### 1. React Query Caching

Configure appropriate cache times:
```typescript
queries: {
  staleTime: 5 * 60 * 1000,  // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
}
```

**Static data** (rarely changes) → Long stale time  
**Dynamic data** (frequently changes) → Short stale time

### 2. Request Deduplication

React Query automatically deduplicates concurrent identical requests:
```typescript
// Component A and B both request cards at same time
// Only one API call is made, both components get the result
const { data } = useGetCardsQuery();
```

### 3. Optimistic Updates

Update UI before API responds:
```typescript
const { mutate } = useUpdateCardMutation({
  onMutate: async (newData) => {
    // Update cache immediately
    queryClient.setQueryData(['card', id], newData);
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['card', id], context.previousData);
  },
});
```

## Testing Strategy

### 1. Service Layer Tests (Unit)
```typescript
describe('authServices', () => {
  it('should call login endpoint with credentials', async () => {
    mock.onPost('/auth/login').reply(200, { access_token: 'token' });
    
    const result = await authServices.login({
      username: 'test',
      password: 'pass'
    });
    
    expect(result.access_token).toBe('token');
  });
});
```

### 2. Query Layer Tests (Integration)
```typescript
describe('useLoginMutation', () => {
  it('should store token on success', async () => {
    const { result } = renderHook(() => useLoginMutation({
      onSuccess: jest.fn()
    }));
    
    await act(async () => {
      result.current.mutate({ username: 'test', password: 'pass' });
    });
    
    expect(mockSetToken).toHaveBeenCalled();
  });
});
```

### 3. E2E Tests
```typescript
it('should login user and navigate to home', async () => {
  await element(by.id('username')).typeText('test');
  await element(by.id('password')).typeText('pass');
  await element(by.id('login-button')).tap();
  
  await expect(element(by.id('home-screen'))).toBeVisible();
});
```

## Scalability

### Adding New Features

With this architecture, adding a new feature API is straightforward:

**1. Create structure:**
```bash
mkdir -p features/cards/api/{types,services,queries}
```

**2. Define types:**
```typescript
// types/cards.types.ts
export type Card = { id: string; balance: number };
```

**3. Create service:**
```typescript
// services/index.ts
export const cardServices = {
  getCards: async () => apiClient.get('/cards')
};
```

**4. Create query:**
```typescript
// queries/use-get-cards-query.ts
export const useGetCardsQuery = () =>
  useQuery({ queryKey: ['cards'], queryFn: cardServices.getCards });
```

**5. Use in component:**
```typescript
const { data: cards } = useGetCardsQuery();
```

## Comparison: Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **API Calls** | Mock data, setTimeout | Real Axios calls |
| **Token** | None | Automatic injection |
| **401 Handling** | Manual in each component | Automatic global |
| **Loading State** | Manual useState | React Query automatic |
| **Error Handling** | Scattered | Centralized + feature-specific |
| **Caching** | None | React Query automatic |
| **Type Safety** | Partial | Full end-to-end |
| **Code Organization** | Mixed | Feature-based |
| **Lines of Code** | ~150 (mock) | ~800 (production-ready) |

## Resources

### Libraries Used
- **Axios** - HTTP client with interceptors
- **React Query** - Data fetching and caching
- **Expo Constants** - Environment variable management
- **AsyncStorage** - Token persistence

### Further Reading
- [React Query Documentation](https://tanstack.com/query/latest)
- [Axios Interceptors Guide](https://axios-http.com/docs/interceptors)
- [React Native Security Best Practices](https://reactnative.dev/docs/security)
- [Feature-Sliced Design](https://feature-sliced.design/)

## Conclusion

Building a proper API integration layer takes time but pays off:

**Investment:**
- ~800 lines of infrastructure code
- 20+ files created
- 8 implementation phases

**Returns:**
- Scalable architecture
- Type safety throughout
- Automatic error handling
- Efficient caching
- Easy to add features
- Team can work in parallel
- Production-ready foundation

The key is treating API integration as a **first-class concern** that deserves proper architecture, not an afterthought where API calls are scattered throughout components.

## Next Steps

After completing this foundation:
1. Add more feature APIs (cards, transactions, profile)
2. Replace all mock data with real API calls
3. Add refresh token flow
4. Implement offline support
5. Add API monitoring/analytics
6. Create API documentation for team

---

**Created:** December 2024  
**Project:** Bianco Mobile Banking App  
**Status:** Production Foundation Complete
