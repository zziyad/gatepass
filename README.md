# GatePass Application

GatePass is a web application for managing item removal requests within an organization, featuring role-based authorization, multi-level approval workflows, and a modern React UI.

## Project Structure

```
gatepass/
├── public/             # Static assets
├── src/                # Source code
│   ├── components/     # Reusable UI components
│   │   ├── ui/         # Base UI components (buttons, inputs, etc.)
│   │   └── ...         # Feature-specific components
│   ├── contexts/       # React context providers
│   │   ├── AppContext.tsx        # Main application context
│   │   └── AuthContext.tsx       # Authentication context
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility libraries
│   │   └── mockData.ts # Development mock data
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin dashboard pages
│   │   └── ...         # Other page components
│   ├── services/       # Service layer
│   │   ├── api/        # API client implementation
│   │   │   ├── client.ts     # Real API client
│   │   │   ├── mock-client.ts # Mock API client for testing
│   │   │   ├── factory.ts    # Client factory based on environment
│   │   │   ├── types.ts      # API types definitions
│   │   │   └── index.ts      # API exports
│   │   └── auth/       # Authentication service
│   │       ├── api-auth-service.ts # API implementation
│   │       ├── mock-auth-service.ts # Mock auth for testing
│   │       ├── adapters.ts   # Data transformation adapters
│   │       ├── types.ts      # Auth service type definitions
│   │       └── index.ts      # Auth service exports
│   ├── types/          # TypeScript type definitions
│   └── App.tsx         # Main application component
└── .env, .env.example  # Environment configuration
```

## Key Features

- **Authentication System**: Cookie-based authentication with role-based access control
- **Service Layer**: Modular service implementations with real and mock versions
- **Admin Dashboard**: Manage users, departments, and removal requests
- **Multi-Level Approval**: HOD → Finance → Security approval workflow
- **Modern UI**: Built with React, TypeScript, and TailwindCSS

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/gatepass.git
   cd gatepass
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to configure your API URL and other settings.

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## API Client Architecture

The application uses a unified API client architecture:

1. **ApiClient Class**: Core implementation for making API requests
2. **MockApiClient**: Testing implementation for development without a backend
3. **Factory Pattern**: Configurable client selection based on environment variables
4. **Service Modules**: Domain-specific service implementations (auth, admin, requests)

### API Request Format

All API requests follow this format:

```json
{
  "id": 123,
  "type": "call",
  "method": "auth/signin",
  "args": {
    // method-specific arguments
  }
}
```

### API Response Format

Server responses follow this structure:

```json
{
  "type": "callback", 
  "id": 7519,
  "result": {
    "status": "logged",
    "response": {
      "msg": "You have successfully logged in",
      "user": {
        "id": 1,
        "email": "admin@admin.com",
        "role": "ADMIN",
        "departmentId": 1
      }
    }
  }
}
```

## User Roles

- **EMPLOYEE**: Can create removal requests
- **HOD**: Department heads who approve the first stage
- **FINANCE**: Financial approval for items
- **SECURITY**: Final approval and physical verification
- **ADMIN**: System administrators with full access

## Development Configuration

The application supports different environments through environment variables:

- `VITE_API_URL`: Backend API URL (default: http://localhost:8001/api)
- `VITE_USE_MOCK_API`: Use mock API client (true/false)
- `VITE_USE_MOCK_AUTH`: Use mock authentication (true/false)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
