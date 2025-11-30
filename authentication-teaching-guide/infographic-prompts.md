# Infographic Prompts for Nano Banana

This document contains detailed prompts for creating visual infographics about authentication, tokens, and middleware. Each prompt is designed to be self-contained and can be used independently.

---

## Prompt 1: Authentication vs Authorization

**Title**: "Authentication vs Authorization - Understanding the Difference"

**Description**: Create an infographic that clearly distinguishes between authentication and authorization using visual metaphors and examples.

**Content to Include**:
- **Left Side - Authentication**: 
  - Visual: Person showing ID card at entrance
  - Text: "Who are you?" / "Identity Verification"
  - Examples: Login, Password, Biometric
  - Icon: Key or ID card
  
- **Right Side - Authorization**:
  - Visual: Person with different access levels (VIP vs Regular)
  - Text: "What can you do?" / "Permission Checking"
  - Examples: Admin access, User permissions, Role-based access
  - Icon: Lock or Shield

- **Bottom Section**:
  - Flow diagram: Authentication → Authorization → Access Granted/Denied
  - Real-world analogy: "Showing ID (Auth) → Checking VIP list (Authz)"

**Style**: Clean, modern, with clear visual separation between the two concepts. Use contrasting colors (e.g., blue for auth, green for authz).

**Size**: 1920x1080px or similar wide format

---

## Prompt 2: Sessions vs Tokens

**Title**: "Sessions vs Tokens - Stateful vs Stateless Authentication"

**Description**: Create a side-by-side comparison infographic showing the differences between session-based and token-based authentication.

**Content to Include**:

**Left Panel - Sessions (Stateful)**:
- Visual: Server with database/storage icon
- Flow: Client → Server → Database → Server → Client
- Key points:
  - Server stores session data
  - Session ID in cookie
  - Easy to revoke
  - Requires server storage
- Use case: Traditional web apps

**Right Panel - Tokens (Stateless)**:
- Visual: Self-contained token icon (like a ticket)
- Flow: Client → Server (validates signature) → Client
- Key points:
  - No server storage needed
  - Token contains user data
  - Harder to revoke
  - Scales well
- Use case: SPAs, Mobile apps, Microservices

**Bottom Section**:
- Decision tree: "When to use Sessions vs Tokens"
- Quick comparison table with checkmarks

**Style**: Use a split-screen design with distinct color schemes. Include icons for server, database, token, and cookie.

**Size**: 1920x1080px

---

## Prompt 3: JWT Token Structure

**Title**: "JWT Token Structure - Understanding the Three Parts"

**Description**: Create a detailed visual breakdown of how a JWT token is structured and encoded.

**Content to Include**:

**Top Section - Visual Token**:
- Show a JWT token string with three colored sections (Header, Payload, Signature)
- Each section separated by dots
- Example: `eyJhbGci...` (Header) `.` `eyJzdWIi...` (Payload) `.` `SflKxwRJ...` (Signature)

**Three Main Sections**:

1. **Header** (Blue):
   - Visual: JSON structure
   - Content: `{ "alg": "HS256", "typ": "JWT" }`
   - Process: Base64Url encoded
   - Purpose: Algorithm and type

2. **Payload** (Green):
   - Visual: JSON structure with user data
   - Content: `{ "sub": "user123", "email": "...", "iat": ..., "exp": ... }`
   - Process: Base64Url encoded
   - Purpose: User data and claims

3. **Signature** (Red):
   - Visual: Lock/security icon
   - Formula: `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)`
   - Purpose: Verify token integrity

**Bottom Section**:
- Flow: Header + Payload → Sign with Secret → Complete Token
- Security note: "Signature ensures token hasn't been tampered with"

**Style**: Use distinct colors for each part. Include code-like formatting for JSON. Make it look technical but approachable.

**Size**: 1920x1080px

---

## Prompt 4: Token Lifecycle

**Title**: "Token Lifecycle - From Login to Expiration"

**Description**: Create a timeline-style infographic showing the complete lifecycle of access and refresh tokens.

**Content to Include**:

**Timeline Flow** (left to right):

1. **Login** (Green):
   - Icon: Login/Key
   - Action: User logs in
   - Output: Access Token (15 min) + Refresh Token (7 days)
   - Visual: Two tokens generated

2. **Active Use** (Blue):
   - Icon: API calls
   - Action: Access token used for requests
   - Duration: 15 minutes
   - Visual: Multiple API requests with token

3. **Token Expiry** (Yellow):
   - Icon: Clock/Expiry
   - Action: Access token expires
   - Response: 401 Unauthorized
   - Visual: Expired token icon

4. **Token Refresh** (Orange):
   - Icon: Refresh/Reload
   - Action: Use refresh token to get new access token
   - Output: New access token + new refresh token (rotation)
   - Visual: Token refresh cycle

5. **Refresh Expiry** (Red):
   - Icon: Stop/Block
   - Action: Refresh token expires
   - Response: User must login again
   - Visual: Login required

**Bottom Section**:
- Token expiration times: Access (15 min) vs Refresh (7 days)
- Best practices: Rotate refresh tokens, short access token lifetime

**Style**: Use a horizontal timeline with distinct phases. Color-code each phase. Include icons and clear labels.

**Size**: 2560x1080px (wide format for timeline)

---

## Prompt 5: Middleware Execution Flow

**Title**: "Middleware - The Request Pipeline"

**Description**: Create an infographic showing how middleware processes requests in a web application.

**Content to Include**:

**Main Flow** (top to bottom):

1. **Request Arrives**:
   - Visual: Incoming request arrow
   - Icon: Network/Request

2. **Middleware Stack** (vertical list):
   - **Logging Middleware**: Logs request details
   - **Body Parser**: Parses request body
   - **CORS Middleware**: Handles cross-origin
   - **Auth Middleware**: Validates token (conditional)
   - **Route Handler**: Business logic
   - **Error Handler**: Catches errors

3. **Response Sent**:
   - Visual: Outgoing response arrow
   - Icon: Response/Checkmark

**Side Panels**:

**Left - Middleware Properties**:
- Runs in order
- Can modify request/response
- Can stop execution
- Must call next() or send response

**Right - Middleware Types**:
- Application-level (all routes)
- Route-level (specific routes)
- Error-handling (last in chain)

**Visual Elements**:
- Use a pipeline/funnel design
- Show request flowing through each middleware
- Use different colors for different middleware types
- Include icons for each middleware function

**Style**: Vertical flow design with clear steps. Use arrows to show direction. Make it look like a pipeline or assembly line.

**Size**: 1080x1920px (portrait) or 1920x1080px (landscape)

---

## Prompt 6: Token Storage Security Comparison

**Title**: "Token Storage Security - Web vs Mobile"

**Description**: Create a comparison infographic showing secure token storage options for web and mobile platforms.

**Content to Include**:

**Top Section - Web (Next.js)**:

1. **HttpOnly Cookies** (Best - Green):
   - Security: ✅ Not accessible to JavaScript
   - XSS Protection: ✅ High
   - CSRF Risk: ⚠️ Medium
   - Visual: Locked cookie icon

2. **Memory/State** (Good - Yellow):
   - Security: ✅ Cleared on refresh
   - XSS Protection: ✅ High
   - Persistence: ❌ Lost on refresh
   - Visual: Memory/RAM icon

3. **localStorage** (Avoid - Red):
   - Security: ❌ Accessible to JavaScript
   - XSS Protection: ❌ Low
   - Visual: Warning icon

**Bottom Section - Mobile (React Native/Expo)**:

1. **SecureStore** (Best - Green):
   - Security: ✅ Encrypted storage
   - Platform: iOS & Android
   - Visual: Secure vault icon

2. **Keychain/Keystore** (Best - Green):
   - Security: ✅ OS-level encryption
   - Platform: Native
   - Visual: Key icon

3. **AsyncStorage** (Avoid - Red):
   - Security: ❌ Not encrypted
   - Visual: Warning icon

**Comparison Table**:
- Security level (High/Medium/Low)
- XSS protection
- Persistence
- Platform support

**Style**: Split design with Web on top, Mobile on bottom. Use color coding (green/yellow/red) for security levels. Include security icons.

**Size**: 1920x1080px

---

## Prompt 7: Authentication Flow - Complete Picture

**Title**: "Complete Authentication Flow - Login to API Access"

**Description**: Create a comprehensive infographic showing the complete authentication flow from user login to making authenticated API requests.

**Content to Include**:

**Flow Steps** (numbered, left to right or top to bottom):

1. **User Login**:
   - User enters credentials
   - Visual: Login form

2. **Server Validation**:
   - Verify credentials
   - Check database
   - Visual: Server with database

3. **Token Generation**:
   - Create access token (15 min)
   - Create refresh token (7 days)
   - Visual: Two tokens generated

4. **Token Storage**:
   - Store securely (HttpOnly cookie or SecureStore)
   - Visual: Secure storage icon

5. **API Request**:
   - Add token to Authorization header
   - Visual: Request with Bearer token

6. **Token Validation**:
   - Server validates token signature
   - Extract user info
   - Visual: Server validating

7. **Response**:
   - Return data or 401 if invalid
   - Visual: Success/Error response

8. **Token Refresh** (if expired):
   - Use refresh token
   - Get new access token
   - Visual: Refresh cycle

**Visual Elements**:
- Use arrows to show flow direction
- Color-code different phases
- Include icons for each step
- Show data flow (tokens, requests, responses)

**Style**: Flowchart or process diagram style. Clear numbering and directional flow. Use consistent iconography.

**Size**: 2560x1080px (wide format)

---

## Prompt 8: Security Best Practices

**Title**: "Authentication Security Best Practices"

**Description**: Create a checklist-style infographic with security best practices for authentication.

**Content to Include**:

**Main Sections**:

1. **Token Security** (Green checkmarks):
   - ✅ Use HTTPS only
   - ✅ Short access token expiry (15 min)
   - ✅ Long refresh token expiry (7 days)
   - ✅ Rotate refresh tokens
   - ✅ Never store tokens in URLs
   - ✅ Use strong JWT secrets

2. **Storage Security** (Green checkmarks):
   - ✅ HttpOnly cookies for web
   - ✅ SecureStore for mobile
   - ✅ Never use localStorage for tokens
   - ✅ Clear tokens on logout

3. **Protection Against Attacks** (Shield icons):
   - 🛡️ XSS: HttpOnly cookies, input sanitization
   - 🛡️ CSRF: SameSite cookies, CSRF tokens
   - 🛡️ MITM: HTTPS, certificate validation
   - 🛡️ Token theft: Short expiry, rotation

4. **Common Mistakes to Avoid** (Red X marks):
   - ❌ Weak secrets
   - ❌ Long token expiry
   - ❌ Storing sensitive data in tokens
   - ❌ Not validating tokens server-side
   - ❌ Exposing tokens in logs

**Visual Layout**:
- Use a checklist format
- Color-code: Green for do's, Red for don'ts
- Include security icons (lock, shield, checkmark, X)
- Group related practices together

**Style**: Clean, organized checklist. Use icons and color coding for quick scanning. Make it poster-worthy.

**Size**: 1920x1080px

---

## Prompt 9: Platform Differences - Next.js vs React Native

**Title**: "Authentication Differences - Next.js vs React Native"

**Description**: Create a side-by-side comparison infographic showing how authentication differs between Next.js (web) and React Native (mobile).

**Content to Include**:

**Split Design - Left: Next.js, Right: React Native**

**Storage Methods**:
- Next.js: HttpOnly cookies, localStorage, sessionStorage, memory
- React Native: SecureStore, AsyncStorage, Keychain/Keystore

**Token Handling**:
- Next.js: Can use cookies, middleware.ts, API routes
- React Native: Headers only, Axios interceptors, secure storage

**Security Features**:
- Next.js: HttpOnly cookies, SameSite, Secure flag
- React Native: Encrypted storage, certificate pinning

**Middleware**:
- Next.js: middleware.ts (Edge runtime), API route middleware
- React Native: Axios interceptors, custom hooks

**Network**:
- Next.js: Usually stable connection
- React Native: Can be intermittent, background handling

**Visual Elements**:
- Platform icons (browser for Next.js, mobile for React Native)
- Side-by-side comparison with matching categories
- Color-code differences

**Style**: Clear split-screen design. Use platform-specific colors/icons. Make differences obvious at a glance.

**Size**: 1920x1080px

---

## Prompt 10: Token Refresh Mechanism

**Title**: "Token Refresh - Keeping Users Authenticated"

**Description**: Create an infographic explaining how token refresh works and why it's important.

**Content to Include**:

**Main Flow** (circular or linear):

1. **Access Token Expires**:
   - Visual: Clock/expiry icon
   - Time: 15 minutes
   - Result: 401 Unauthorized

2. **Client Detects Expiry**:
   - Visual: Error detection
   - Action: Interceptor catches 401

3. **Refresh Request**:
   - Visual: Refresh token sent
   - Endpoint: POST /api/auth/refresh
   - Data: Refresh token only

4. **Server Validates**:
   - Visual: Server checking
   - Checks: Token signature, expiry, version

5. **New Tokens Generated**:
   - Visual: New tokens created
   - Output: New access + refresh tokens

6. **Token Rotation**:
   - Visual: Old refresh token invalidated
   - Security: Prevents token reuse

7. **Retry Original Request**:
   - Visual: Request retried
   - Result: Success with new token

**Key Benefits Section**:
- ✅ Seamless user experience
- ✅ No re-login needed
- ✅ Enhanced security (rotation)
- ✅ Short access token lifetime

**Visual Style**:
- Use a circular or flow diagram
- Show the refresh cycle clearly
- Include time indicators
- Use arrows to show flow

**Size**: 1920x1080px

---

## Usage Instructions

1. **Copy the prompt** you want to use
2. **Paste into Nano Banana** (or your preferred AI image generator)
3. **Adjust if needed** based on the tool's requirements
4. **Generate the infographic**
5. **Review and iterate** if needed

## Tips for Best Results

- Use specific dimensions mentioned in each prompt
- The prompts are designed to be detailed - feel free to simplify if the tool requires shorter prompts
- You can combine related prompts (e.g., combine Prompt 1 and 2 for a comprehensive comparison)
- Adjust colors and style to match your preferences
- Consider creating multiple versions with different styles (minimalist, detailed, etc.)

---

**Note**: These prompts are optimized for creating educational infographics. Adjust the technical details and visual descriptions based on your target audience and the capabilities of your image generation tool.

