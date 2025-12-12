> **STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.

# POSTD API Reference

This document describes the API routes available in POSTD.

## Authentication

All `/api/app/*` routes require authentication. If the user is not authenticated, they will receive a 401 Unauthorized response.

Authentication is handled automatically by Supabase through cookies.

## Endpoints

### GET `/api/app/active-workspace`

Get the current user's active workspace and user information.

**Authentication**: Required

**Response**: 200 OK
```json
{
  "workspace": {
    "id": "uuid",
    "name": "John's Workspace",
    "created_by": "uuid",
    "created_at": "2025-01-01T00:00:00Z",
    "role": "owner"
  },
  "user": {
    "id": "uuid",
    "email": "john@example.com"
  }
}
```

**Response**: 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

**Response**: 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

**Usage Example**:
```typescript
const response = await fetch('/api/app/active-workspace')
const data = await response.json()

if (response.ok) {
  console.log('Current workspace:', data.workspace.name)
} else {
  console.error('Error:', data.error)
}
```

---

## Future API Endpoints

The following endpoints are planned for future phases:

### Workspaces

- `GET /api/app/workspaces` - List all workspaces for current user
- `POST /api/app/workspaces` - Create a new workspace
- `PATCH /api/app/workspaces/:id` - Update workspace name
- `DELETE /api/app/workspaces/:id` - Delete workspace
- `GET /api/app/workspaces/:id/members` - List workspace members
- `POST /api/app/workspaces/:id/members` - Invite a member
- `DELETE /api/app/workspaces/:id/members/:userId` - Remove a member

### Websites (Phase 2)

- `GET /api/app/websites` - List connected websites
- `POST /api/app/websites` - Connect a new website
- `GET /api/app/websites/:id` - Get website details
- `DELETE /api/app/websites/:id` - Remove website
- `POST /api/app/websites/:id/crawl` - Trigger a crawl

### Social Accounts (Phase 3)

- `GET /api/app/social-accounts` - List connected social accounts
- `POST /api/app/social-accounts` - Connect a social account
- `DELETE /api/app/social-accounts/:id` - Disconnect account
- `POST /api/app/social-accounts/:id/sync` - Sync content

### Brand Guide (Phase 4)

- `GET /api/app/brand-guide` - Get current brand guide
- `PATCH /api/app/brand-guide` - Update brand guide
- `POST /api/app/brand-guide/generate` - Regenerate brand guide

### Content Generation (Phase 5)

- `POST /api/app/content/generate` - Generate new content
- `GET /api/app/content` - List generated content
- `GET /api/app/content/:id` - Get specific content
- `DELETE /api/app/content/:id` - Delete content

---

## Error Handling

All API routes follow a consistent error response format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE" // optional
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not allowed to access resource)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently, there is no rate limiting implemented.

**Future**: Rate limiting will be added in production:
- Authenticated users: 100 requests per minute
- Content generation: 10 requests per minute

## Webhooks

Webhooks will be added in future phases for:
- Website crawl completion
- Social account sync completion
- Brand guide generation completion

## SDK / Client Libraries

Currently, API calls should be made using the native `fetch` API.

**Future**: Consider creating a TypeScript SDK:
```typescript
import { PostdClient } from '@postd/sdk'

const client = new PostdClient({ apiKey: 'xxx' })
await client.workspaces.list()
await client.content.generate({ prompt: 'Blog post about...' })
```

