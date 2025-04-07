# Removal Request System API Requirements

This document outlines the backend API requirements for implementing the Removal Request System, including endpoints for creating requests and managing expired items.

## API Response Contract Format

All API responses follow this standard structure:

```typescript
{
  "type": "callback", 
  "id": number,  // Request ID
  "result": {
    "status": string,  // "success" or "error"
    "response": {
      "msg": string,  // Message to display to the user
      // Additional data specific to each endpoint
    }
  }
}
```

## Removal Request Endpoints

### 1. Create New Removal Request

**URL:** `POST /api/removals`

**Function:** `createRemovalRequest()`

**Request Body:**
```typescript
{
  "removalTerms": string,  // "RETURNABLE" or "NON_RETURNABLE"
  "dateFrom": string,      // ISO date format
  "dateTo": string | null, // ISO date format, required if RETURNABLE
  "employee": string,      // For NON_RETURNABLE items
  "departmentId": number,
  "itemDescription": string,
  "removalReasonId": number,
  "customReason": string | null, // Required if "Other" is selected
  "images": string[]       // Base64 encoded image strings
}
```

**Response:**
```typescript
{
  "type": "callback",
  "id": 1234,
  "result": {
    "status": "success",
    "response": {
      "msg": "Removal request created successfully",
      "removal": {
        "id": number,
        "status": string,
        "createdAt": string, // ISO date
        // Other removal details
      }
    }
  }
}
```

### 2. Get Removal Requests

**URL:** `GET /api/removals`

**Function:** `getRemovalRequests()`

**Query Parameters:**
- `status`: Filter by status
- `userId`: Filter by user
- `departmentId`: Filter by department
- `page`: Pagination page number
- `limit`: Items per page

**Response:**
```typescript
{
  "type": "callback",
  "id": 1235,
  "result": {
    "status": "success",
    "response": {
      "msg": "Removal requests retrieved successfully",
      "removals": [
        {
          "id": number,
          "userId": number,
          "userName": string,
          "departmentName": string,
          "removalTerms": string,
          "dateFrom": string,
          "dateTo": string | null,
          "itemDescription": string,
          "status": string,
          "createdAt": string,
          // Other removal details
        }
      ],
      "pagination": {
        "total": number,
        "page": number,
        "limit": number,
        "pages": number
      }
    }
  }
}
```

### 3. Get Single Removal Request

**URL:** `GET /api/removals/:id`

**Function:** `getRemovalRequestById()`

**Response:**
```typescript
{
  "type": "callback",
  "id": 1236,
  "result": {
    "status": "success",
    "response": {
      "msg": "Removal request retrieved successfully",
      "removal": {
        // Full removal details including approvals and images
        "id": number,
        "userId": number,
        "userName": string,
        "departmentName": string,
        "removalTerms": string,
        "dateFrom": string,
        "dateTo": string | null,
        "itemDescription": string,
        "status": string,
        "approvals": [
          {
            "id": number,
            "level": string,
            "approverId": number,
            "approverName": string,
            "approval": string,
            "signature": string | null,
            "signatureDate": string | null
          }
        ],
        "images": [
          {
            "id": number,
            "url": string
          }
        ],
        "createdAt": string
      }
    }
  }
}
```

## Expiration Management Endpoints

### 1. Get Expiring Items

**URL:** `GET /api/removals/expiring`

**Function:** `getExpiringItems()`

**Query Parameters:**
- `days`: Number of days to look ahead (default: 7)
- `departmentId`: Filter by department

**Response:**
```typescript
{
  "type": "callback",
  "id": 1237,
  "result": {
    "status": "success",
    "response": {
      "msg": "Expiring items retrieved successfully",
      "expiringItems": [
        {
          "id": number,
          "itemDescription": string,
          "userName": string,
          "departmentName": string,
          "dateFrom": string,
          "dateTo": string,
          "daysRemaining": number
        }
      ]
    }
  }
}
```

### 2. Get Overdue Items

**URL:** `GET /api/removals/overdue`

**Function:** `getOverdueItems()`

**Query Parameters:**
- `departmentId`: Filter by department

**Response:**
```typescript
{
  "type": "callback",
  "id": 1238,
  "result": {
    "status": "success",
    "response": {
      "msg": "Overdue items retrieved successfully",
      "overdueItems": [
        {
          "id": number,
          "itemDescription": string,
          "userName": string,
          "departmentName": string,
          "dateFrom": string,
          "dateTo": string,
          "daysOverdue": number
        }
      ]
    }
  }
}
```

### 3. Record Item Return

**URL:** `POST /api/removals/:id/return`

**Function:** `recordItemReturn()`

**Request Body:**
```typescript
{
  "returnDate": string,        // ISO date format
  "condition": string,         // Condition on return
  "notes": string | null,
  "receivedById": number       // ID of user receiving the item
}
```

**Response:**
```typescript
{
  "type": "callback",
  "id": 1239,
  "result": {
    "status": "success",
    "response": {
      "msg": "Item return recorded successfully",
      "returnRecord": {
        "id": number,
        "removalId": number,
        "returnDate": string,
        "condition": string,
        "receivedBy": string,
        "createdAt": string
      }
    }
  }
}
```

### 4. Request Return Date Extension

**URL:** `POST /api/removals/:id/extend`

**Function:** `requestReturnExtension()`

**Request Body:**
```typescript
{
  "newReturnDate": string,     // ISO date format
  "extensionReason": string,
  "requestedById": number      // ID of user requesting extension
}
```

**Response:**
```typescript
{
  "type": "callback",
  "id": 1240,
  "result": {
    "status": "success",
    "response": {
      "msg": "Extension request submitted successfully",
      "extensionRequest": {
        "id": number,
        "removalId": number,
        "originalReturnDate": string,
        "newReturnDate": string,
        "extensionReason": string,
        "status": "PENDING", // PENDING, APPROVED, REJECTED
        "createdAt": string
      }
    }
  }
}
```

### 5. Approve or Reject Extension Request

**URL:** `PUT /api/removals/extensions/:id`

**Function:** `processExtensionRequest()`

**Request Body:**
```typescript
{
  "approved": boolean,
  "comments": string | null,
  "processedById": number
}
```

**Response:**
```typescript
{
  "type": "callback",
  "id": 1241,
  "result": {
    "status": "success",
    "response": {
      "msg": "Extension request processed successfully",
      "extensionRequest": {
        "id": number,
        "status": string,
        "processedBy": string,
        "processedAt": string
      }
    }
  }
}
```

## Notification Endpoints

### 1. Get User Notifications

**URL:** `GET /api/notifications`

**Function:** `getUserNotifications()`

**Query Parameters:**
- `type`: Filter by notification type
- `read`: Filter by read status (true/false)

**Response:**
```typescript
{
  "type": "callback",
  "id": 1242,
  "result": {
    "status": "success",
    "response": {
      "msg": "Notifications retrieved successfully",
      "notifications": [
        {
          "id": number,
          "type": string,
          "message": string,
          "isRead": boolean,
          "createdAt": string,
          "removalId": number,
          "itemDescription": string
        }
      ]
    }
  }
}
```

### 2. Mark Notification as Read

**URL:** `PUT /api/notifications/:id/read`

**Function:** `markNotificationRead()`

**Response:**
```typescript
{
  "type": "callback",
  "id": 1243,
  "result": {
    "status": "success",
    "response": {
      "msg": "Notification marked as read",
      "notificationId": number
    }
  }
}
```

## Supporting Endpoints

### 1. Get Removal Reasons

**URL:** `GET /api/removal-reasons`

**Function:** `getRemovalReasons()`

**Response:**
```typescript
{
  "type": "callback",
  "id": 1244,
  "result": {
    "status": "success",
    "response": {
      "msg": "Removal reasons retrieved successfully",
      "reasons": [
        {
          "id": number,
          "name": string
        }
      ]
    }
  }
}
```

### 2. Upload Removal Image

**URL:** `POST /api/removals/:id/images`

**Function:** `uploadRemovalImage()`

**Request Body:**
```typescript
{
  "image": string // Base64 encoded image
}
```

**Response:**
```typescript
{
  "type": "callback",
  "id": 1245,
  "result": {
    "status": "success",
    "response": {
      "msg": "Image uploaded successfully",
      "image": {
        "id": number,
        "url": string
      }
    }
  }
}
```

### 3. Delete Removal Image

**URL:** `DELETE /api/removals/:removalId/images/:imageId`

**Function:** `deleteRemovalImage()`

**Response:**
```typescript
{
  "type": "callback",
  "id": 1246,
  "result": {
    "status": "success",
    "response": {
      "msg": "Image deleted successfully"
    }
  }
}
```

## Error Handling

All endpoints should return appropriate error responses:

```typescript
{
  "type": "callback",
  "id": number,
  "result": {
    "status": "error",
    "error": {
      "code": string,
      "message": string,
      "details": any // Optional additional error information
    }
  }
}
```

Common error codes:
- `INVALID_INPUT`: Validation errors in request data
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: User not authorized for this action
- `FORBIDDEN`: User doesn't have permission for this action
- `SERVER_ERROR`: Internal server error

## Database Schema Improvements

For proper expiration management, consider adding these tables:

### Return Status Table
```prisma
model ReturnRecord {
  id                Int       @id @default(autoincrement())
  removalId         Int
  removal           Removal   @relation(fields: [removalId], references: [id])
  returnDate        DateTime
  condition         String    // "Good", "Damaged", etc.
  notes             String?
  receivedById      Int
  receivedBy        User      @relation(fields: [receivedById], references: [id])
  createdAt         DateTime  @default(now())
}
```

### Extension Request Table
```prisma
model ExtensionRequest {
  id                Int       @id @default(autoincrement())
  removalId         Int
  removal           Removal   @relation(fields: [removalId], references: [id])
  originalDate      DateTime
  newDate           DateTime
  reason            String
  status            String    // "PENDING", "APPROVED", "REJECTED"
  requestedById     Int
  requestedBy       User      @relation(fields: [requestedById], references: [id])
  processedById     Int?
  processedBy       User?     @relation("ProcessedExtensions", fields: [processedById], references: [id])
  processedAt       DateTime?
  comments          String?
  createdAt         DateTime  @default(now())
}
```

### Notification Table
```prisma
model RemovalNotification {
  id            Int       @id @default(autoincrement())
  removalId     Int
  removal       Removal   @relation(fields: [removalId], references: [id])
  type          String    // "APPROACHING_RETURN", "OVERDUE", etc.
  message       String
  isRead        Boolean   @default(false)
  createdAt     DateTime  @default(now())
  userId        Int       // Who should receive the notification
  user          User      @relation(fields: [userId], references: [id])
}
```

## Implementation Plan

This section outlines the step-by-step implementation plan for the Removal Request System. Each step should be completed before moving to the next one.

### Phase 1: Core Removal Request Functionality

1. **Database Schema Updates**
   - [+] Update Prisma schema with new models (Removal, RemovalReason, RemovalImage, Approval)
   - [+] Create migration and apply to database
   - [+] Verify database tables are created correctly

2. **Backend API Implementation**
   - [ ] Create controller for Removal Requests (`src/controllers/removalController.ts`)
   - [ ] Implement `createRemovalRequest()` function
   - [ ] Implement `getRemovalRequests()` function with filtering options 
   - [ ] Implement `getRemovalRequestById()` function
   - [ ] Create controller for Removal Reasons (`src/controllers/removalReasonController.ts`)
   - [ ] Implement `getRemovalReasons()` function
   - [ ] Create image upload/delete functionality
   - [ ] Set up API routes in Express router

3. **Frontend Implementation**
   - [ ] Create removal request form component
   - [ ] Implement form validation for required fields
   - [ ] Add conditional logic for returnable vs non-returnable items
   - [ ] Create image upload component with preview
   - [ ] Implement API service for communicating with backend
   - [ ] Create removal request list view with filters
   - [ ] Implement detailed view for individual removal requests

4. **Testing Core Functionality**
   - [ ] Unit test backend controllers and services
   - [ ] Integration test API endpoints
   - [ ] Test form validation edge cases
   - [ ] Test image upload functionality
   - [ ] Verify data persistence in database

### Phase 2: Approval Workflow

1. **Backend Implementation**
   - [ ] Implement approval workflow state machine
   - [ ] Create approval controller with approve/reject functions
   - [ ] Add email notifications for status changes
   - [ ] Implement signature capture and storage

2. **Frontend Implementation**
   - [ ] Create approval dashboard for different approval levels
   - [ ] Implement signature capture component
   - [ ] Add status indicators and history view
   - [ ] Create notification component for pending approvals

3. **Testing Approval Workflow**
   - [ ] Test approval process end-to-end
   - [ ] Verify correct permissions for different user roles
   - [ ] Test email notifications delivery
   - [ ] Verify signature storage and display

### Phase 3: Expiration Management

1. **Database Schema Updates**
   - [ ] Add ReturnRecord model
   - [ ] Add ExtensionRequest model
   - [ ] Add RemovalNotification model
   - [ ] Create and apply migration

2. **Backend Implementation**
   - [ ] Create scheduled job to check for approaching expirations
   - [ ] Implement notification generation for expiring items
   - [ ] Create controller for return management (`src/controllers/returnController.ts`)
   - [ ] Implement `recordItemReturn()` function
   - [ ] Create controller for extensions (`src/controllers/extensionController.ts`)
   - [ ] Implement `requestReturnExtension()` function
   - [ ] Implement `processExtensionRequest()` function
   - [ ] Implement `getExpiringItems()` and `getOverdueItems()` functions

3. **Frontend Implementation**
   - [ ] Create returns dashboard for tracking expiring/overdue items
   - [ ] Implement return recording form
   - [ ] Create extension request form
   - [ ] Implement notifications display in user interface
   - [ ] Add extension approval workflow for administrators

4. **Testing Expiration Management**
   - [ ] Test expiration detection logic
   - [ ] Verify notification generation and delivery
   - [ ] Test return recording process
   - [ ] Test extension request and approval workflow

### Phase 4: Reporting and Analytics

1. **Backend Implementation**
   - [ ] Create data aggregation services for reporting
   - [ ] Implement endpoints for retrieval statistics
   - [ ] Create export functionality for reports (CSV, PDF)

2. **Frontend Implementation**
   - [ ] Create analytics dashboard
   - [ ] Implement charts and data visualization
   - [ ] Add filtering and date range selection
   - [ ] Create printable report views

3. **Testing Reporting**
   - [ ] Verify data accuracy in reports
   - [ ] Test export functionality
   - [ ] Performance test with large datasets
   - [ ] Test printer-friendly formatting

### Phase 5: Mobile Optimization and Enhancements

1. **Mobile UI Improvements**
   - [ ] Optimize all views for mobile devices
   - [ ] Implement responsive designs for forms
   - [ ] Add mobile-specific features (camera access, etc.)

2. **QR/Barcode Integration**
   - [ ] Implement QR code generation for removal items
   - [ ] Create scanner functionality for quick returns
   - [ ] Add QR codes to printable forms

3. **Performance Optimization**
   - [ ] Implement caching for frequently accessed data
   - [ ] Optimize database queries
   - [ ] Add pagination for large datasets
   - [ ] Implement lazy loading for images

4. **Final Testing**
   - [ ] Comprehensive end-to-end testing
   - [ ] Security testing (permission checks, input validation)
   - [ ] Performance testing under load
   - [ ] Cross-browser and device testing 