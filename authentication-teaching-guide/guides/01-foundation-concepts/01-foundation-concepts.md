# Module 1: Foundation Concepts

> **Understanding the fundamentals of authentication, authorization, sessions, and tokens**

---

## Authentication vs Authorization

**Authentication** = "Who are you?" (Identity verification)
- Verifies that a user is who they claim to be
- Examples: Login with username/password, biometric authentication
- Result: User identity is confirmed

**Authorization** = "What can you do?" (Permission checking)
- Determines what resources/actions a user can access
- Examples: Admin-only pages, user-specific data access
- Result: Access granted or denied

**Analogy**: 
- **Authentication** is like showing your ID at a club entrance (proving who you are)
- **Authorization** is like the bouncer checking if you're on the VIP list (what you can access)

```typescript
// Authentication: Verifying identity
async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (user && await verifyPassword(password, user.hashedPassword)) {
    return user; // ✅ Authenticated
  }
  return null; // ❌ Authentication failed
}

// Authorization: Checking permissions
function canAccessResource(user: User, resource: Resource): boolean {
  if (user.role === 'admin') return true;
  if (resource.ownerId === user.id) return true;
  return false; // ❌ Not authorized
}
```

## Sessions vs Tokens

### Sessions (Stateful)
- **What**: Server stores authentication state
- **How**: Server creates a session ID, stores it in memory/database, sends ID to client
- **Client stores**: Session ID (usually in cookie)
- **Server stores**: Session data (user info, expiration)

**Flow**:
```
1. User logs in → Server creates session → Stores in memory/DB
2. Server sends session ID (cookie) → Client stores cookie
3. Client sends session ID with each request
4. Server looks up session → Validates → Returns data
5. User logs out → Server destroys session
```

**Pros**:
- Server has full control
- Easy to revoke (delete session)
- Can store additional data server-side

**Cons**:
- Requires server-side storage
- Doesn't scale well (needs shared storage for multiple servers)
- More complex for mobile apps

### Tokens (Stateless)
- **What**: Self-contained authentication data
- **How**: Server creates token with user info, signs it, sends to client
- **Client stores**: Token (localStorage, SecureStore, memory)
- **Server stores**: Nothing (token is self-contained)

**Flow**:
```
1. User logs in → Server creates token → Signs it
2. Server sends token → Client stores token
3. Client sends token with each request (in header)
4. Server validates token signature → Extracts user info
5. User logs out → Client deletes token (server can't revoke until expiry)
```

**Pros**:
- Stateless (no server storage needed)
- Scales well (works across multiple servers)
- Works great for mobile/SPAs
- Can contain user data (reduces DB queries)

**Cons**:
- Harder to revoke (must wait for expiry or use token blacklist)
- Larger request size (token in every request)
- Security depends on proper storage

### When to Use Sessions vs Tokens

**Use Sessions when**:
- Traditional web apps with server-side rendering
- Need immediate revocation capability
- Want server-side session management
- Working with cookies is acceptable

**Use Tokens when**:
- Single Page Applications (SPAs)
- Mobile apps (React Native)
- Microservices architecture
- Need stateless authentication
- Cross-domain authentication

## Stateless vs Stateful Authentication

**Stateful (Sessions)**:
```
Client → Request with Session ID → Server
                                    ↓
                              Check Session Store
                                    ↓
                              Valid? → Return Data
```

**Stateless (Tokens)**:
```
Client → Request with Token → Server
                               ↓
                         Validate Token Signature
                               ↓
                         Valid? → Extract User Info → Return Data
```

## Web vs Mobile Differences

| Aspect | Web (Next.js) | Mobile (React Native/Expo) |
|--------|---------------|----------------------------|
| **Storage** | localStorage, cookies, sessionStorage | SecureStore, AsyncStorage |
| **Cookies** | Native support | Not available (use headers) |
| **Security** | HTTPS + HttpOnly cookies | SecureStore (encrypted) |
| **Token Refresh** | Can use cookies | Must use headers |
| **Background** | Tab can stay active | App may be backgrounded |
| **Network** | Usually stable | Can be intermittent |

## Core Terminology

- **Access Token**: Short-lived token for API access (15min - 1hr)
- **Refresh Token**: Long-lived token to get new access tokens (days/weeks)
- **JWT (JSON Web Token)**: Standard token format (Header.Payload.Signature)
- **Bearer Token**: Token sent in Authorization header (`Bearer <token>`)
- **Session**: Server-side stored authentication state
- **Cookie**: Small data stored by browser (can be HttpOnly, Secure)
- **Middleware**: Code that runs before/after request handling
- **Interceptor**: Code that modifies requests/responses (Axios)
- **CORS**: Cross-Origin Resource Sharing (web security)
- **XSS**: Cross-Site Scripting (injecting malicious code)
- **CSRF**: Cross-Site Request Forgery (unauthorized actions)

---

## Related Visuals

### Infographics

![Sessions vs Tokens](infographic.jpg)

### Diagrams

![Session vs Token Authentication Flow](diagram.png)

---

## Navigation

- [↑ Back to README](../../README.md)
- [Next: Token Types & Structure →](../02-token-types-structure/02-token-types-structure.md)

