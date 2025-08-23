# Deals Management System

## Overview

The deals management system provides a complete CRUD (Create, Read, Update, Delete) interface for managing travel deals on the PRTD platform. It features a clean admin interface, RESTful API, and persistent JSON storage.

## Accessing the System

**URL:** `/deals`  
**Authentication:** None (internal route only, not linked in navigation)  
**Browser Access:** Navigate directly to `https://puertoricotraveldeals.com/deals`

## Deal Structure

Each deal contains the following fields:

| Field | Type | Required | Constraints | Example |
|-------|------|----------|-------------|---------|
| `id` | string (UUID) | Auto-generated | System assigned | `550e8400-e29b-41d4-a716-446655440001` |
| `title` | string | ✅ | 1-80 characters | `"Beach Resort Weekend"` |
| `description` | string | ✅ | 0-180 characters | `"Escape to paradise with..."` |
| `amountLabel` | string | ✅ | 1-20 characters | `"30% off"`, `"$50 off"` |
| `location` | string | ✅ | 1-60 characters | `"San Juan"` |
| `image` | string | ✅ | Must start with `/images/` | `"/images/deal-photo.png"` |
| `category` | enum | ✅ | `restaurant`, `activity`, `hotel`, `tour` | `"hotel"` |
| `expiry` | string (ISO date) | ❌ | ISO date format or empty | `"2024-12-31T23:59:59.000Z"` |
| `partner` | string | ❌ | 0-80 characters | `"Paradise Beach Resort"` |

## User Interface

### Main Interface (`/deals`)

The deals management page provides:

- **Header section** with page title and deal count
- **"Add New Deal" button** to create new deals
- **Responsive card grid** displaying all deals (3 columns on desktop, 2 on tablet, 1 on mobile)
- **Deal cards** with edit/delete actions

### Deal Cards

Each deal card displays:
- **Deal image** (aspect ratio maintained)
- **Title and category badge** (color-coded by category)
- **Description** (truncated to 3 lines)
- **Location and amount label**
- **Partner name** (if specified)
- **Expiry date** (red if expired)
- **Edit and Delete buttons**

### Deal Form

The add/edit form includes:
- **Title field** (required, max 80 chars)
- **Description textarea** (max 180 chars)
- **Amount label** (required, max 20 chars)
- **Location** (required, max 60 chars)
- **Image path** (required, must start with `/images/`)
- **Category dropdown** (restaurant/activity/hotel/tour)
- **Expiry datetime picker** (optional)
- **Partner field** (optional, max 80 chars)

## API Reference

### Base URL
`/api/deals`

### Endpoints

#### GET /api/deals
**Purpose:** Retrieve all deals  
**Method:** `GET`  
**Response:** Array of deal objects  
**Status Codes:**
- `200` - Success
- `429` - Rate limit exceeded
- `500` - Server error

**Example Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Beach Resort Weekend",
    "description": "Escape to paradise with our exclusive weekend package.",
    "amountLabel": "30% off",
    "location": "San Juan",
    "image": "/images/mock-deal-1.png",
    "category": "hotel",
    "expiry": "2024-12-31T23:59:59.000Z",
    "partner": "Paradise Beach Resort"
  }
]
```

#### POST /api/deals
**Purpose:** Create a new deal  
**Method:** `POST`  
**Body:** Deal object (without `id`)  
**Status Codes:**
- `201` - Deal created successfully
- `422` - Validation error
- `429` - Rate limit exceeded
- `500` - Server error

**Example Request:**
```json
{
  "title": "New Adventure Tour",
  "description": "Explore hidden gems of Puerto Rico",
  "amountLabel": "20% off",
  "location": "Camuy",
  "image": "/images/new-tour.png",
  "category": "tour",
  "expiry": "2024-08-31T23:59:59.000Z",
  "partner": "Adventure Co"
}
```

#### PUT /api/deals
**Purpose:** Update an existing deal  
**Method:** `PUT`  
**Body:** Deal object with `id` + fields to update  
**Status Codes:**
- `200` - Deal updated successfully
- `404` - Deal not found
- `422` - Validation error
- `429` - Rate limit exceeded
- `500` - Server error

**Example Request:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Updated Beach Resort Weekend",
  "amountLabel": "40% off"
}
```

#### DELETE /api/deals
**Purpose:** Delete a deal  
**Method:** `DELETE`  
**Body:** `{ "id": "deal-uuid" }`  
**Status Codes:**
- `200` - Deal deleted successfully
- `404` - Deal not found
- `429` - Rate limit exceeded
- `500` - Server error

### Error Responses

All endpoints return consistent error formats:

```json
{
  "error": "Error message",
  "details": {
    "field": ["validation error message"]
  }
}
```

### Rate Limiting

All API endpoints are protected by rate limiting:
- **Limit:** Based on IP address
- **Response:** `429 Too Many Requests`
- **Message:** `"Too many requests. Please try again later."`

## Data Storage

### Storage Method
- **Format:** JSON file storage
- **Location:** `data/deals.json`
- **Backup:** Automatic atomic writes (`deals.json.tmp` → `deals.json`)

### Data Persistence
- All changes are immediately persisted to disk
- Atomic writes prevent data corruption
- No external database required

### Seeded Data
The system comes pre-loaded with 3 example deals:
1. **Beach Resort Weekend** (hotel category)
2. **Rainforest Adventure Tour** (tour category)  
3. **Authentic Mofongo Experience** (restaurant category)

## Validation Rules

### Server-Side Validation (Zod Schema)
- All fields validated against strict constraints
- Category restricted to 4 allowed values
- Image paths must start with `/images/`
- ISO date format enforced for expiry dates
- Comprehensive error messages returned

### Client-Side Validation
- HTML5 form validation (required fields, maxlength)
- Real-time character count feedback
- Category dropdown prevents invalid selections
- Datetime picker for proper date formatting

## Image Management

### Image Storage
- **Location:** `/public/images/` directory
- **Access:** Public via `/images/` URL path
- **Management:** Manual file upload to server

### Image Requirements
- **Path format:** Must start with `/images/`
- **Validation:** Path validation only (no file existence check)
- **Examples:** `/images/deal-photo.png`, `/images/resort-view.jpg`

### Existing Assets
Pre-loaded images available:
- `/images/mock-deal-1.png`
- `/images/mock-deal-2.png` 
- `/images/mock-deal-3.png`
- `/images/mock-deal-4.png`

## Security Considerations

### Access Control
- **No authentication** required (internal admin tool)
- **No public navigation** links (unlinked route)
- **Direct URL access** required

### Input Validation
- **Server-side validation** on all inputs
- **SQL injection protection** (N/A - JSON storage)
- **XSS prevention** via React's built-in escaping
- **Rate limiting** on all API endpoints

### Data Integrity
- **Atomic file writes** prevent corruption
- **UUID generation** for unique IDs
- **Schema validation** ensures data consistency

## Technical Architecture

### Frontend Stack
- **React** with TypeScript
- **Next.js Pages Router**
- **Tailwind CSS** with design tokens
- **Client-side state management**

### Backend Stack
- **Next.js API Routes**
- **Node.js filesystem operations**
- **Zod validation library**
- **JSON file storage**

### Component Structure
```
src/ui/deals/
├── DealCard.tsx          # Individual deal display
├── DealForm.tsx          # Add/edit form
├── DealsGrid.tsx         # Grid layout component
└── DealsManager.tsx      # Main orchestrator
```

## Maintenance & Operations

### Backup Recommendations
- **Regular backups** of `data/deals.json`
- **Version control** tracking of changes
- **Monitor file permissions** on data directory

### Monitoring
- **API endpoint health** via `/api/health`
- **File system space** for JSON storage
- **Error logs** for validation failures

### Troubleshooting

#### Common Issues
1. **"Failed to load deals"** - Check file permissions on `data/deals.json`
2. **Validation errors** - Review field constraints in this document
3. **Rate limiting** - Reduce API request frequency
4. **Images not displaying** - Verify file exists in `/public/images/`

#### Recovery Steps
1. **Restore from backup** if `deals.json` is corrupted
2. **Restart service** with `sudo systemctl restart prtd`
3. **Check logs** in application error logs
4. **Verify file permissions** on data directory

## Development Notes

### Code Organization
- **API logic:** `pages/api/deals.ts`
- **Data layer:** `src/lib/dealsStore.ts`
- **Validation:** `src/lib/forms.ts` (dealSchema)
- **Components:** `src/ui/deals/`

### Testing
- **Unit tests:** `__tests__/deals.test.tsx`
- **Visual tests:** `tests/visual/deals.spec.ts`
- **Manual testing:** Form validation, CRUD operations

### Future Enhancements
- Image upload functionality
- Bulk import/export
- Deal analytics and reporting
- User authentication
- Database migration path

---

*Last updated: August 2025*  
*System version: 1.0*