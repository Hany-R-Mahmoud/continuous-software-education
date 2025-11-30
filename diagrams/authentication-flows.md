# Authentication Flow Diagrams

## Login Flow Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant Server
    participant Database

    User->>Client: Enter credentials<br/>(email, password)
    Client->>Server: POST /api/auth/login<br/>{ email, password }
    Server->>Database: Verify credentials
    Database-->>Server: User data or null
    alt Credentials valid
        Server->>Server: Generate tokens<br/>(access + refresh)
        Server->>Database: Store refresh token<br/>(optional)
        Server-->>Client: { accessToken, refreshToken }
        Client->>Client: Store tokens securely
        Client->>User: Redirect to dashboard
    else Credentials invalid
        Server-->>Client: 401 Unauthorized
        Client->>User: Show error message
    end
```

## Token Refresh Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Auth Server
    participant Database

    Client->>API: Request with access token
    API->>API: Validate token
    alt Token expired
        API-->>Client: 401 Unauthorized
        Client->>Auth Server: POST /api/auth/refresh<br/>{ refreshToken }
        Auth Server->>Auth Server: Verify refresh token
        Auth Server->>Database: Check token version
        Database-->>Auth Server: Token valid
        Auth Server->>Auth Server: Generate new tokens
        Auth Server->>Database: Update refresh token<br/>(rotation)
        Auth Server-->>Client: { accessToken, refreshToken }
        Client->>Client: Store new tokens
        Client->>API: Retry original request<br/>with new token
        API-->>Client: 200 OK with data
    else Token valid
        API-->>Client: 200 OK with data
    end
```

## Middleware Execution Flow

```mermaid
graph TD
    A[Request Arrives] --> B[Middleware 1<br/>Logging]
    B --> C[Middleware 2<br/>Body Parser]
    C --> D[Middleware 3<br/>CORS]
    D --> E{Protected Route?}
    E -->|Yes| F[Auth Middleware<br/>Validate Token]
    E -->|No| G[Route Handler]
    F -->|Token Valid| G
    F -->|Token Invalid| H[401 Response]
    G --> I[Business Logic]
    I --> J[Response]
    J --> K[Response Middleware<br/>Error Handler]
    K --> L[Send to Client]
    H --> K
```

## Session vs Token Authentication

```mermaid
graph LR
    subgraph "Session-Based (Stateful)"
        A1[Client] -->|1. Login| B1[Server]
        B1 -->|2. Create Session| C1[Session Store]
        B1 -->|3. Send Session ID| A1
        A1 -->|4. Request + Session ID| B1
        B1 -->|5. Lookup Session| C1
        C1 -->|6. Session Data| B1
        B1 -->|7. Response| A1
    end
    
    subgraph "Token-Based (Stateless)"
        A2[Client] -->|1. Login| B2[Server]
        B2 -->|2. Generate Token| B2
        B2 -->|3. Send Token| A2
        A2 -->|4. Request + Token| B2
        B2 -->|5. Validate Signature| B2
        B2 -->|6. Extract User Info| B2
        B2 -->|7. Response| A2
    end
```

## Token Structure (JWT)

```mermaid
graph TD
    A[JWT Token] --> B[Header]
    A --> C[Payload]
    A --> D[Signature]
    
    B --> B1["Base64Url Encoded<br/>{ alg: 'HS256', typ: 'JWT' }"]
    C --> C1["Base64Url Encoded<br/>{ sub, email, role, iat, exp }"]
    D --> D1["HMACSHA256<br/>(header + payload, secret)"]
    
    B1 --> E[Header.Payload.Signature]
    C1 --> E
    D1 --> E
    
    style A fill:#e1f5ff
    style E fill:#c8e6c9
```

## Request Flow with Axios Interceptors

```mermaid
sequenceDiagram
    participant Component
    participant Axios
    participant Request Interceptor
    participant API
    participant Response Interceptor

    Component->>Axios: api.get('/data')
    Axios->>Request Interceptor: Intercept request
    Request Interceptor->>Request Interceptor: Get token from storage
    Request Interceptor->>Request Interceptor: Add Authorization header
    Request Interceptor->>API: Request with token
    API-->>Response Interceptor: Response
    alt Status 200
        Response Interceptor->>Component: Return data
    else Status 401
        Response Interceptor->>Response Interceptor: Refresh token
        Response Interceptor->>API: Retry original request
        API-->>Component: Return data
    end
```

## Protected Route Flow (Next.js)

```mermaid
graph TD
    A[User navigates to /dashboard] --> B[Middleware.ts runs]
    B --> C{Token exists?}
    C -->|No| D[Redirect to /login]
    C -->|Yes| E[Validate token]
    E -->|Invalid| D
    E -->|Valid| F[Allow access]
    F --> G[Render dashboard]
    
    H[User navigates to /login] --> B
    C -->|Yes| I[Redirect to /dashboard]
    C -->|No| J[Show login form]
```

## Token Storage Comparison

```mermaid
graph TD
    A[Token Storage Options] --> B[Web - Next.js]
    A --> C[Mobile - React Native]
    
    B --> B1[HttpOnly Cookies<br/>✅ Most Secure]
    B --> B2[Memory<br/>⚠️ Lost on refresh]
    B --> B3[localStorage<br/>❌ XSS vulnerable]
    
    C --> C1[SecureStore<br/>✅ Encrypted]
    C --> C2[AsyncStorage<br/>⚠️ Not encrypted]
    C --> C3[Keychain/Keystore<br/>✅ Most secure]
    
    style B1 fill:#c8e6c9
    style C1 fill:#c8e6c9
    style C3 fill:#c8e6c9
    style B3 fill:#ffcdd2
```

## Complete Authentication Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    Unauthenticated --> LoggingIn: User enters credentials
    LoggingIn --> Authenticated: Login success
    LoggingIn --> Unauthenticated: Login failed
    Authenticated --> MakingRequest: User makes API call
    MakingRequest --> TokenExpired: Access token expired
    MakingRequest --> Authenticated: Request success
    TokenExpired --> Refreshing: Refresh token
    Refreshing --> Authenticated: Refresh success
    Refreshing --> Unauthenticated: Refresh failed
    Authenticated --> LoggingOut: User logs out
    LoggingOut --> Unauthenticated: Tokens cleared
```

## Middleware Chain Visualization

```mermaid
graph LR
    A[Incoming Request] --> B[Middleware 1<br/>Logging]
    B --> C[Middleware 2<br/>Body Parser]
    C --> D[Middleware 3<br/>CORS]
    D --> E[Route-Specific<br/>Auth Middleware]
    E --> F[Route Handler]
    F --> G[Response]
    G --> H[Error Middleware]
    H --> I[Outgoing Response]
    
    style A fill:#e3f2fd
    style I fill:#c8e6c9
    style E fill:#fff9c4
```

## Token Rotation Flow

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Database

    Client->>Server: POST /auth/refresh<br/>{ oldRefreshToken }
    Server->>Server: Verify old refresh token
    Server->>Database: Check token version
    Database-->>Server: Version matches
    Server->>Server: Increment token version
    Server->>Database: Update user tokenVersion
    Server->>Server: Generate new tokens
    Server->>Database: Store new refresh token<br/>(optional)
    Server-->>Client: { newAccessToken, newRefreshToken }
    Note over Client,Server: Old refresh token now invalid
    Client->>Client: Store new tokens
```

