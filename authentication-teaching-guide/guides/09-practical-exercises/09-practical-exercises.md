# Module 9: Practical Exercises

> **Practical Exercises**

---


### Exercise 1: Implement Token Storage (Next.js)

**Task**: Create a token storage utility for Next.js that:
- Stores access token in HttpOnly cookie
- Stores refresh token in HttpOnly cookie
- Provides functions to get/clear tokens

**Solution**:
```typescript
// lib/token-storage.ts
import { cookies } from 'next/headers';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export async function storeTokens(accessToken: string, refreshToken: string) {
  cookies().set(ACCESS_TOKEN_KEY, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 900, // 15 minutes
  });
  
  cookies().set(REFRESH_TOKEN_KEY, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 604800, // 7 days
  });
}

export async function getAccessToken(): Promise<string | null> {
  return cookies().get(ACCESS_TOKEN_KEY)?.value || null;
}

export async function getRefreshToken(): Promise<string | null> {
  return cookies().get(REFRESH_TOKEN_KEY)?.value || null;
}

export async function clearTokens() {
  cookies().delete(ACCESS_TOKEN_KEY);
  cookies().delete(REFRESH_TOKEN_KEY);
}
```

### Exercise 2: Implement Token Storage (React Native)

**Task**: Create a token storage utility for React Native using SecureStore.

**Solution**:
```typescript
// lib/token-storage.ts
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export async function storeTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
```

### Exercise 3: Create Auth Middleware (Express)

**Task**: Create authentication middleware that:
- Validates JWT token
- Handles expired tokens
- Attaches user to request

**Solution**: (See Module 4 for complete example)

### Exercise 4: Create Auth Middleware (Next.js)

**Task**: Create Next.js API route middleware wrapper.

**Solution**: (See Module 4 for complete example)

### Exercise 5: Build Refresh Token Flow

**Task**: Implement complete refresh token flow with:
- Automatic token refresh on 401
- Token rotation
- Error handling

**Solution**: (See Module 3 and Module 5 for complete examples)

---

## Key Takeaways

### Authentication Concepts
- **Authentication** = Who you are
- **Authorization** = What you can do
- **Sessions** = Server-side state
- **Tokens** = Self-contained, stateless

### Token Management
- **Access tokens**: Short-lived (15min-1hr)
- **Refresh tokens**: Long-lived (7-30 days)
- **Storage**: Secure (HttpOnly cookies or SecureStore)
- **Rotation**: Issue new refresh token on each refresh

### Middleware
- Runs between request and response
- Executes in order
- Can modify request/response
- Must call `next()` or send response

### Security
- Always use HTTPS
- HttpOnly cookies for web
- SecureStore for mobile
- Short token expiry
- Token rotation
- Never store tokens in URLs

### Platform Differences
- **Next.js**: HttpOnly cookies, middleware.ts, API routes
- **React Native**: SecureStore, headers only, background handling

---

## Additional Resources

- [JWT.io](https://jwt.io) - JWT debugger and information
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Expo SecureStore Docs](https://docs.expo.dev/versions/latest/sdk/securestore/)

---

**End of Guide**

---

## Related Visuals

### Infographics

![Practical Exercises](infographic.jpg)

### Diagrams

![Practical Exercises Diagram](diagram.png)

---

## Navigation

- [← Previous: Security Best Practices](../08-security-best-practices/08-security-best-practices.md)
- [↑ Back to README](../../README.md)
