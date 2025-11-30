# Module 2: Token Types & Structure

> **Understanding JWT structure, access tokens, refresh tokens, and TypeScript types**

---

## JWT (JSON Web Token) Structure

A JWT has three parts separated by dots (`.`):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Format**: `HEADER.PAYLOAD.SIGNATURE`

### 1. Header
Contains token type and signing algorithm:
```json
{
  "alg": "HS256",  // Algorithm (HMAC SHA256)
  "typ": "JWT"     // Type (always JWT)
}
```
Base64Url encoded → `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

### 2. Payload (Claims)
Contains user data and metadata:
```json
{
  "sub": "1234567890",           // Subject (user ID)
  "name": "John Doe",            // User name
  "email": "john@example.com",   // User email
  "iat": 1516239022,             // Issued at (timestamp)
  "exp": 1516242622,             // Expiration (timestamp)
  "role": "user"                 // Custom claim
}
```
Base64Url encoded → `eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ`

### 3. Signature
Created by signing header + payload with secret:
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

## Access Tokens vs Refresh Tokens

### Access Token
- **Purpose**: Authenticate API requests
- **Lifetime**: Short (15 minutes - 1 hour)
- **Storage**: Memory or secure storage
- **Contains**: User ID, permissions, expiration
- **Usage**: Sent with every API request

```typescript
interface AccessTokenPayload {
  sub: string;        // User ID
  email: string;
  role: string;
  iat: number;        // Issued at
  exp: number;        // Expires at (short)
}
```

### Refresh Token
- **Purpose**: Get new access tokens
- **Lifetime**: Long (7 days - 30 days)
- **Storage**: Secure storage only (HttpOnly cookie or SecureStore)
- **Contains**: User ID, token version (for rotation)
- **Usage**: Only sent to refresh endpoint

```typescript
interface RefreshTokenPayload {
  sub: string;        // User ID
  tokenVersion: number; // For rotation/revocation
  iat: number;
  exp: number;        // Expires at (long)
}
```

## Token Expiration Strategy

**Why expiration matters**:
- Limits damage if token is stolen
- Forces re-authentication periodically
- Allows revocation through refresh token rotation

**Common Pattern**:
```
Access Token: 15 minutes
Refresh Token: 7 days
```

**Flow**:
1. Access token expires → Client detects 401
2. Client uses refresh token → Gets new access token
3. If refresh token expires → User must login again

## TypeScript Token Types

```typescript
// Token payload types
export interface JWTPayload {
  sub: string;           // Subject (user ID)
  iat: number;          // Issued at
  exp: number;           // Expires at
  [key: string]: any;   // Additional claims
}

export interface AccessTokenPayload extends JWTPayload {
  email: string;
  role: string;
  permissions?: string[];
}

export interface RefreshTokenPayload extends JWTPayload {
  tokenVersion: number;
}

// Token response types
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;    // Seconds until access token expires
}

// Decoded token (after verification)
export interface DecodedToken<T extends JWTPayload = JWTPayload> {
  payload: T;
  header: {
    alg: string;
    typ: string;
  };
}
```

## Token Claims Best Practices

**Standard Claims (RFC 7519)**:
- `sub` (subject): User ID
- `iat` (issued at): Timestamp
- `exp` (expires at): Timestamp
- `iss` (issuer): Who created the token
- `aud` (audience): Who the token is for

**Custom Claims**:
- Keep minimal (don't store sensitive data)
- Don't store passwords or secrets
- Store only what's needed for authorization
- Consider token size (affects request size)

---

## Related Visuals

### Infographics

![JWT Structure](infographic.jpg)

### Diagrams

![Token Structure Diagram](diagram.png)

---

## Navigation

- [← Previous: Foundation Concepts](../01-foundation-concepts/01-foundation-concepts.md)
- [↑ Back to README](../../README.md)
- [Next: Authentication Flows →](../03-authentication-flows/03-authentication-flows.md)

