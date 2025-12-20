# API Documentation

Base URL: `http://localhost:5000/api` (development)

## Authentication

All API endpoints (except `/health`) require authentication using Firebase ID tokens.

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

## Endpoints

### Health Check

#### GET `/health`
Check if the server is running.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## Lost Items

### Report Lost Item

#### POST `/api/lost-items`

Report a new lost item.

**Headers:**
- `Content-Type: multipart/form-data`
- `Authorization: Bearer <token>`

**Body (FormData):**
```
itemName: string (required)
category: string (required)
description: string (required)
location: string (required)
dateLost: date (required) - format: YYYY-MM-DD
secretQuestion: string (required)
secretAnswer: string (required)
image: file (optional) - max 5MB, jpg/png/webp
```

**Response (201):**
```json
{
  "message": "Lost item reported successfully",
  "item": {
    "id": 1,
    "itemName": "Blue Laptop Bag",
    "category": "Bags & Backpacks",
    "status": "pending"
  }
}
```

### Get All Lost Items

#### GET `/api/lost-items`

Get all lost items with optional filters.

**Query Parameters:**
- `category` (optional): Filter by category
- `status` (optional): Filter by status (pending, matched, closed)
- `search` (optional): Search in item name and description

**Response (200):**
```json
[
  {
    "id": 1,
    "item_name": "Blue Laptop Bag",
    "category": "Bags & Backpacks",
    "description": "Navy blue laptop bag with broken zipper",
    "location": "Library 3rd Floor",
    "date_lost": "2024-01-15",
    "image_url": "https://res.cloudinary.com/...",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### Get Lost Item by ID

#### GET `/api/lost-items/:id`

Get details of a specific lost item.

**Response (200):**
```json
{
  "id": 1,
  "item_name": "Blue Laptop Bag",
  "category": "Bags & Backpacks",
  "description": "Navy blue laptop bag with broken zipper",
  "location": "Library 3rd Floor",
  "date_lost": "2024-01-15",
  "image_url": "https://res.cloudinary.com/...",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Delete Lost Item

#### DELETE `/api/lost-items/:id`

Delete a lost item (only by owner).

**Response (200):**
```json
{
  "message": "Lost item deleted successfully"
}
```

---

## Found Items

### Report Found Item

#### POST `/api/found-items`

Report a new found item.

**Headers:**
- `Content-Type: multipart/form-data`
- `Authorization: Bearer <token>`

**Body (FormData):**
```
itemName: string (required)
category: string (required)
description: string (required)
location: string (required)
dateFound: date (required) - format: YYYY-MM-DD
secretDetail: string (required)
image: file (required) - max 5MB, jpg/png/webp
```

**Response (201):**
```json
{
  "message": "Found item reported successfully",
  "item": {
    "id": 1,
    "itemName": "Blue Laptop Bag",
    "category": "Bags & Backpacks",
    "status": "pending"
  }
}
```

### Get All Found Items

#### GET `/api/found-items`

Get all found items with optional filters.

**Query Parameters:**
- `category` (optional): Filter by category
- `status` (optional): Filter by status
- `search` (optional): Search in item name and description

**Response (200):**
```json
[
  {
    "id": 1,
    "item_name": "Blue Laptop Bag",
    "category": "Bags & Backpacks",
    "description": "Found near the library entrance",
    "location": "Library Main Entrance",
    "date_found": "2024-01-16",
    "image_url": "https://res.cloudinary.com/...",
    "status": "pending",
    "created_at": "2024-01-16T09:00:00Z"
  }
]
```

### Get Found Item by ID

#### GET `/api/found-items/:id`

Get details of a specific found item.

**Response (200):**
```json
{
  "id": 1,
  "item_name": "Blue Laptop Bag",
  "category": "Bags & Backpacks",
  "description": "Found near the library entrance",
  "location": "Library Main Entrance",
  "date_found": "2024-01-16",
  "image_url": "https://res.cloudinary.com/...",
  "status": "pending",
  "created_at": "2024-01-16T09:00:00Z"
}
```

### Delete Found Item

#### DELETE `/api/found-items/:id`

Delete a found item (only by owner).

**Response (200):**
```json
{
  "message": "Found item deleted successfully"
}
```

---

## Matches

### Get My Matches

#### GET `/api/matches/my-matches`

Get all matches for the current user.

**Response (200):**
```json
[
  {
    "id": 1,
    "matchScore": 0.87,
    "status": "matched",
    "matchedAt": "2024-01-16T10:00:00Z",
    "yourItem": {
      "type": "lost",
      "itemName": "Blue Laptop Bag",
      "category": "Bags & Backpacks",
      "imageUrl": "https://..."
    },
    "matchedItem": {
      "type": "found",
      "itemName": "Blue Laptop Bag",
      "category": "Bags & Backpacks",
      "imageUrl": "https://..."
    },
    "requiresVerification": true,
    "secretQuestion": "What brand is written inside?"
  }
]
```

### Get Match by ID

#### GET `/api/matches/:matchId`

Get details of a specific match.

**Response (200):**
```json
{
  "id": 1,
  "lost_item_id": 1,
  "found_item_id": 1,
  "match_score": 0.87,
  "image_similarity": 0.92,
  "text_similarity": 0.78,
  "status": "matched",
  "verification_attempts": 0,
  "created_at": "2024-01-16T10:00:00Z"
}
```

### Verify Match

#### POST `/api/matches/:matchId/verify`

Answer the secret question to verify ownership.

**Body:**
```json
{
  "answer": "Nike"
}
```

**Response (200):**
```json
{
  "message": "Ownership verified! Both parties will be notified.",
  "verified": true
}
```

**Response (400) - Wrong Answer:**
```json
{
  "message": "Incorrect answer. Please try again.",
  "verified": false,
  "attemptsRemaining": 2
}
```

**Response (400) - Max Attempts:**
```json
{
  "message": "Maximum verification attempts exceeded. Case escalated to admin review."
}
```

---

## Users

### Get My Reports

#### GET `/api/users/my-reports`

Get all reports (lost and found) by the current user.

**Response (200):**
```json
{
  "lost": [
    {
      "id": 1,
      "item_name": "Blue Laptop Bag",
      "category": "Bags & Backpacks",
      "description": "...",
      "location": "Library",
      "date_lost": "2024-01-15",
      "image_url": "https://...",
      "status": "matched",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "found": [
    {
      "id": 2,
      "item_name": "Red Wallet",
      "category": "Accessories",
      "description": "...",
      "location": "Cafeteria",
      "date_found": "2024-01-16",
      "image_url": "https://...",
      "status": "pending",
      "created_at": "2024-01-16T11:00:00Z"
    }
  ]
}
```

### Get Profile

#### GET `/api/users/profile`

Get current user's profile.

**Response (200):**
```json
{
  "id": 1,
  "email": "student@student.gitam.edu",
  "display_name": "John Doe",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## Admin

### Get Admin Cases

#### GET `/api/admin/cases`

Get all pending admin review cases.

**Response (200):**
```json
[
  {
    "id": 1,
    "match_id": 5,
    "reason": "Maximum verification attempts exceeded",
    "status": "pending",
    "created_at": "2024-01-16T15:00:00Z",
    "match_score": 0.72,
    "lost_item_name": "Blue Laptop Bag",
    "lost_image_url": "https://...",
    "found_item_name": "Blue Laptop Bag",
    "found_image_url": "https://..."
  }
]
```

### Resolve Admin Case

#### POST `/api/admin/cases/:caseId/resolve`

Resolve an admin case.

**Body:**
```json
{
  "resolution": "Verified items match after manual inspection",
  "matchVerified": true
}
```

**Response (200):**
```json
{
  "message": "Case resolved successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "All fields are required"
}
```

### 401 Unauthorized
```json
{
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. Only GITAM university emails are allowed."
}
```

### 404 Not Found
```json
{
  "message": "Lost item not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Failed to report lost item",
  "error": "Database connection error"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per 15 minutes per IP address
- 429 status code when limit exceeded

---

## Categories

Available item categories:
- Electronics
- Books & Stationery
- Clothing
- Accessories
- ID Cards & Documents
- Keys
- Bags & Backpacks
- Jewelry
- Sports Equipment
- Other

---

## Status Values

### Lost/Found Items:
- `pending`: Not matched yet
- `matched`: Potential match found
- `closed`: Successfully reunited

### Matches:
- `matched`: Waiting for verification
- `verified`: Ownership confirmed
- `admin_review`: Escalated to admin
- `rejected`: Not a valid match

---

## Testing with cURL

### Report Lost Item
```bash
curl -X POST http://localhost:5000/api/lost-items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "itemName=Blue Laptop Bag" \
  -F "category=Bags & Backpacks" \
  -F "description=Navy blue bag with broken zipper" \
  -F "location=Library 3rd Floor" \
  -F "dateLost=2024-01-15" \
  -F "secretQuestion=What brand is it?" \
  -F "secretAnswer=Nike" \
  -F "image=@/path/to/image.jpg"
```

### Get All Lost Items
```bash
curl -X GET http://localhost:5000/api/lost-items \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Verify Match
```bash
curl -X POST http://localhost:5000/api/matches/1/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answer":"Nike"}'
```
