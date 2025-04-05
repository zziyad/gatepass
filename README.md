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

Todo List for Implementation Removal Request

1. Backend API Requirements
[ ] Create API endpoint for submitting new removal requests (POST /api/removals)
[ ] Ensure API validates all required fields from the Removal model
[ ] Implement proper error handling and response structure
[ ] Add support for image upload with the removal request
[ ] Implement status workflow that aligns with the approval levels
2. Frontend Form Updates
[ ] Update RemovalRequestForm to match all fields in the Removal model:
[ ] Properly handle removalTerms (currently "term" in frontend)
[ ] Implement proper date handling with dateFrom/dateTo
[ ] Add proper employee field handling
[ ] Ensure departmentId is properly passed and handled
[ ] Improve image upload with proper backend integration
3. Frontend Types and Context Updates
[ ] Align RemovalRequest interface with the database Removal model:
[ ] Update field names to match exactly (e.g., removalTerms vs term)
[ ] Ensure types match (string vs number for IDs, etc.)
[ ] Update the approval stages to match the new workflow levels
[ ] Update RequestsContext to use the API instead of localStorage:
[ ] Replace addRequest implementation to call the backend API
[ ] Implement proper error handling and loading states
[ ] Add refresh/fetch capabilities to keep the request list updated
4. Workflow Implementation
[ ] Update the approval workflow to match the new LEVEL-based structure:
[ ] Change the status values from HOD/FINANCE to LEVEL-based values
[ ] Update the Approval model to use the new level values
[ ] Ensure the correct level of approver can approve requests at each stage
5. UI/UX Improvements
[ ] Add a Standard Operating Procedure (SOP) display component:
[ ] Create static SOP content or fetch from backend
[ ] Display relevant SOP information based on removal type
[ ] Add admin functionality to update SOP documentation
[ ] Improve form validation and error messages
[ ] Add responsive design improvements for mobile users
[ ] Add confirmation dialogs for submission and approval actions
6. Data Migration Considerations
[ ] Plan for migrating existing data if the structure changes
[ ] Consider backward compatibility for existing requests
[ ] Test with both new and existing data
Key Questions/Clarifications Needed



Immediate Next Steps
Clarify API contract between frontend and backend
Update the RemovalRequestForm to align with the database schema
Create or update API service functions for managing removal requests
Implement SOP display component
Update RequestsContext to use the real API instead of localStorage