# GatePass Application

## Project Structure

```
gatepass/
├── public/             # Static assets
├── src/                # Source code
│   ├── components/     # Reusable UI components
│   │   ├── ui/         # Base UI components (buttons, inputs, etc.)
│   │   └── ...         # Feature-specific components
│   ├── contexts/       # React context providers
│   │   ├── AuthContext.tsx       # Authentication context
│   │   └── RequestsContext.tsx   # Requests management context
│   ├── hooks/          # Custom React hooks
│   ├── adapters/       # Data transformation adapters
│   ├── utils/          # Utility functions
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin dashboard pages
│   │   └── ...         # Other page components
│   ├── services/       # Service layer
│   │   ├── api/        # API client implementation
│   │   └── auth/       # Authentication service
│   ├── types/          # TypeScript type definitions
│   └── routes.ts       # Application routing definitions
```

## Routing Structure

- `/login` - Authentication page
- `/dashboard` - Main user dashboard
- `/new-request` - Create a new removal request
- `/my-requests` - View user's requests
- `/request/:id` - View specific request details
- `/approvals` - View requests pending approval
- `/profile` - User profile page

### Admin Routes

- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/departments` - Department management
- `/admin/removal-reasons` - Manage removal reasons

## TODO

- Implement SOP (Standard Operating Procedure) display for removal items
- Add admin functionality to update SOP documentation
- Fix date handling issues in request display
- Update role management to display user-friendly role names:
  - LEVEL_1 → "Requester"
  - LEVEL_2 → "Department Approval"
  - LEVEL_3 → "Finance Approval"
  - LEVEL_4 → "Management Approval"
  - SECURITY → "Security Approval"
  - ADMIN → "Administrator"
- Create a beautiful user card component to display:
  - Full name
  - Email address
  - Department
  - Position
  - Role (using friendly names)
- Update role management to support new level-based hierarchy
- Implement position field display across user-related views
- Fix user sidebar display to show consistent information
- Consolidate user fields to use fullName consistently
- Add mobile responsiveness improvements
- Implement request export functionality
- Add reporting and analytics features
