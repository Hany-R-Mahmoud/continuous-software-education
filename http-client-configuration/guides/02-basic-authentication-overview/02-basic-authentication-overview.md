# Module 2: Basic Authentication Overview

> **Understanding Basic Authentication: what it is, how it works, and when to use it**

---

## What is Basic Authentication?

**Basic Authentication** (Basic Auth) is a simple HTTP authentication scheme where the client sends credentials (username and password) with each request.

### How It Works

1. **Client sends credentials**: Username and password
2. **Credentials are base64-encoded** (not encrypted)
3. **Sent in the `Authorization` header**
4. **Server decodes and validates** the credentials

---

## The Format

```
Authorization: Basic base64(username:password)
```

### Step-by-Step Process

1. **Combine**: `username:password` → `"john:secret123"`
2. **Base64 encode**: `"john:secret123"` → `"am9objpzZWNyZXQxMjM="`
3. **Add prefix**: `"Basic am9objpzZWNyZXQxMjM="`
4. **Send in header**: `Authorization: Basic am9objpzZWNyZXQxMjM="`

### Example

```typescript
// Step 1: Combine username and password
const credentials = `${username}:${password}`;
// Result: "user@example.com:MyP@ssw0rd!"

// Step 2: Base64 encode
const basicAuth = 'Basic ' + encode(credentials);
// Result: "Basic dXNlckBleGFtcGxlLmNvbTpNeVBAc3N3MHJkIQ=="

// Step 3: Send in HTTP header
headers: {
  Authorization: basicAuth,
}
```

---

## Visual Flow

```
┌─────────┐                    ┌─────────┐
│ Client  │                    │ Server  │
└────┬────┘                    └────┬────┘
     │                              │
     │  1. User enters credentials  │
     │  username: "user"            │
     │  password: "pass"            │
     │                              │
     │  2. Encode: "user:pass"      │
     │  → base64: "dXNlcjpwYXNz"    │
     │                              │
     │  3. GET /auth                │
     │  Authorization: Basic         │
     │  dXNlcjpwYXNz                │
     ├─────────────────────────────>│
     │                              │  4. Decode: "dXNlcjpwYXNz"
     │                              │  → "user:pass"
     │                              │
     │                              │  5. Validate credentials
     │                              │
     │  { access_token: "..." }     │
     │<─────────────────────────────┤
     │                              │
     │  6. Use access_token for      │
     │  future requests (Bearer)    │
     │                              │
```

---

## Security Considerations

### ⚠️ Important Security Facts

1. **Base64 is NOT encryption** - It's easily reversible
   - Anyone can decode: `dXNlcjpwYXNz` → `user:pass`
   - It's encoding, not encryption

2. **Must use HTTPS** - Always!
   - Without HTTPS, credentials are visible in plain text
   - With HTTPS, the connection is encrypted
   - **Never use Basic Auth over HTTP in production**

3. **Credentials sent with every request**
   - No automatic expiration
   - If intercepted, can be reused
   - Consider using tokens for ongoing requests

### Security Best Practices

```typescript
// ✅ GOOD: Use HTTPS
const data = await apiClient.get('https://api.example.com/auth', {
  headers: { Authorization: basicAuth }
});

// ❌ BAD: Never use HTTP
const data = await apiClient.get('http://api.example.com/auth', {
  headers: { Authorization: basicAuth }
});
```

---

## When Is Basic Auth Used?

### ✅ Common Use Cases

- **API authentication** (like login endpoints)
- **Simple internal services**
- **Development/testing**
- **When combined with HTTPS for production**
- **Initial authentication** (then exchange for tokens)

### ❌ Not Recommended For

- **Public-facing web apps** (use OAuth2, JWT instead)
- **Long-lived sessions** (use tokens)
- **High-security applications** (use more secure methods)
- **Without HTTPS** (never!)

---

## Comparison with Other Methods

| Method | Security | Complexity | Use Case |
|--------|---------|------------|----------|
| **Basic Auth** | Low-Medium (with HTTPS) | Simple | APIs, simple auth |
| **Bearer Token (JWT)** | Medium-High | Medium | Modern web apps |
| **OAuth2** | High | Complex | Third-party auth |
| **API Keys** | Low-Medium | Simple | Service-to-service |

---

## Typical Authentication Flow

In most applications, Basic Auth is used for **initial login**, then exchanged for a token:

```
1. User enters username/password
2. Client sends Basic Auth header → GET /auth
3. Server validates credentials
4. Server returns: { access_token: "jwt-token-here" }
5. Client uses access_token for future requests (Bearer token)
```

### Example Implementation

```typescript
// Step 1: Login with Basic Auth
async function login(username: string, password: string) {
  const credentials = `${username}:${password}`;
  const basicAuth = 'Basic ' + encode(credentials);
  
  // Use Basic Auth for login
  const data = await publicInstance.get('/auth', {
    headers: { Authorization: basicAuth }
  });
  
  // Step 2: Get access token
  const accessToken = data.access_token;
  
  // Step 3: Set token for future requests
  authInstance.tokenize(accessToken);
  
  return data;
}

// Step 4: Use Bearer token for protected routes
async function getUserData() {
  // Token automatically included via authInstance
  const data = await authInstance.get('/user');
  return data;
}
```

---

## Real-World Example

### Login Service Implementation

```typescript
import { publicInstance } from '@mdp-eg-org/aurora-modules';
import { encode } from 'base-64';

export const authServices = {
  login: async (params: { username: string; password: string }) => {
    // Encode credentials as Basic Auth
    const credentials = `${params.username}:${params.password}`;
    const basicAuth = 'Basic ' + encode(credentials);

    // Use GET with Basic Auth header (matching production API)
    const data = await publicInstance.get('/auth/login', {
      headers: {
        Authorization: basicAuth,
        clientId: '1234',
        'g-recaptcha-response': '100',
      },
    });

    return data;
  },
};
```

**What's happening:**
1. Username and password are combined
2. Credentials are base64-encoded
3. `Authorization: Basic ...` header is created
4. Request is sent to login endpoint
5. Server validates and returns access token

---

## Common Mistakes

### ❌ Mistake 1: Not Using HTTPS

```typescript
// ❌ BAD: Credentials exposed
const data = await fetch('http://api.example.com/auth', {
  headers: { Authorization: basicAuth }
});
```

### ❌ Mistake 2: Storing Credentials

```typescript
// ❌ BAD: Don't store credentials
localStorage.setItem('password', password);
```

### ❌ Mistake 3: Using Basic Auth for All Requests

```typescript
// ❌ BAD: Using Basic Auth for every request
// Should use Bearer token after initial login
const data = await apiClient.get('/user', {
  headers: { Authorization: basicAuth }
});
```

### ✅ Correct Approach

```typescript
// ✅ GOOD: Use Basic Auth only for login
const loginData = await publicInstance.get('/auth', {
  headers: { Authorization: basicAuth }
});

// ✅ GOOD: Use Bearer token for other requests
authInstance.tokenize(loginData.access_token);
const userData = await authInstance.get('/user');
```

---

## Summary

### Key Takeaways

1. **Basic Auth = username:password encoded in base64** - Sent in `Authorization` header
2. **Simple but not secure by itself** - Always use HTTPS
3. **Good for API authentication** - Especially for initial login
4. **Exchange for tokens** - Use Basic Auth for login, then use Bearer tokens
5. **Follow the standard** - Format: `Authorization: Basic base64(username:password)`

### Next Steps

- Read **[Module 3: Encoding in Authentication](../03-encoding-in-authentication/03-encoding-in-authentication.md)** to understand why encoding is needed
- Study **[Module 4: Axios Provider Configuration](../04-axios-provider-configuration/04-axios-provider-configuration.md)** for implementation details

---

**The bottom line**: Basic Auth is a simple way to send credentials. It's fine for login when used over HTTPS, but for ongoing requests, use the access token (Bearer token) you receive back.
