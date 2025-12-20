# System Architecture Diagrams

## Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                    │
│  (Students with @student.gitam.edu or @gitam.in emails)         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React.js)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Login      │  │   Report     │  │   Browse     │         │
│  │   (Google)   │  │   Lost/Found │  │   Items      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Matches    │  │  My Reports  │  │   Verify     │         │
│  │              │  │              │  │   Ownership  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  Technologies: React, Material-UI, TensorFlow.js, Firebase     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / REST API
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Auth       │  │   Items      │  │   Matching   │         │
│  │   Middleware │  │   Controller │  │   Service    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Image      │  │   Text       │  │   Admin      │         │
│  │   Analysis   │  │   Analysis   │  │   Controller │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  Technologies: Express, TensorFlow.js, Natural.js, Bcrypt      │
└──────────────┬────────────────┬──────────────┬─────────────────┘
               │                │              │
               ▼                ▼              ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  PostgreSQL  │ │  Cloudinary  │ │   Firebase   │
    │   Database   │ │    Images    │ │     Auth     │
    └──────────────┘ └──────────────┘ └──────────────┘
```

## Data Flow: Lost Item Report

```
┌──────────┐
│  User    │
│  Fills   │
│  Form    │
└────┬─────┘
     │
     ▼
┌────────────────────────────────────┐
│  Frontend Validation               │
│  • Check image size/type           │
│  • Validate required fields        │
│  • Extract client-side features    │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  API Request (multipart/form-data) │
│  POST /api/lost-items              │
│  • itemName, category, description │
│  • location, dateLost              │
│  • secretQuestion, secretAnswer    │
│  • image (file)                    │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Backend: Auth Middleware          │
│  • Verify Firebase token           │
│  • Check email domain              │
│  • Get/create user in DB           │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Backend: Image Processing         │
│  • Upload to Cloudinary            │
│  • Resize to 224x224               │
│  • Extract MobileNet features      │
│  • Get 1024-d vector               │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Backend: Store in Database        │
│  • Hash secret answer (bcrypt)     │
│  • Save item details               │
│  • Save image URL                  │
│  • Save feature vector (JSON)      │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Backend: Trigger Auto-Match       │
│  • Query found items (same cat)    │
│  • Calculate similarity scores     │
│  • Check threshold (>70%)          │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  If Match Found:                   │
│  • Create match record             │
│  • Update item status: "matched"   │
│  • Notify users                    │
│                                    │
│  If No Match:                      │
│  • Status remains "pending"        │
│  • Item added to search pool       │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Response to Frontend              │
│  • Success message                 │
│  • Item ID and status              │
│  • Match notification (if any)     │
└────────────────────────────────────┘
```

## AI Matching Algorithm Flow

```
┌─────────────────────────────────────────────────────────────┐
│             NEW ITEM REPORTED (Lost or Found)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  Extract     │
                  │  Features    │
                  └──────┬───────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
    ┌──────────┐                 ┌──────────┐
    │  Image   │                 │   Text   │
    │ Features │                 │ Features │
    │ (1024-d) │                 │(Tokens)  │
    └──────┬───┘                 └────┬─────┘
           │                          │
           └──────────┬───────────────┘
                      │
                      ▼
           ┌────────────────────┐
           │  Query Database    │
           │  • Same category   │
           │  • Status: pending │
           └──────────┬─────────┘
                      │
                      ▼
           ┌────────────────────┐
           │  For Each Item:    │
           └──────────┬─────────┘
                      │
      ┌───────────────┴───────────────┐
      │                               │
      ▼                               ▼
┌─────────────┐               ┌─────────────┐
│   IMAGE     │               │    TEXT     │
│ SIMILARITY  │               │ SIMILARITY  │
│             │               │             │
│ Cosine      │               │ Levenshtein │
│ Similarity  │               │ + TF-IDF    │
│             │               │             │
│ Weight: 35% │               │ Weight: 30% │
└──────┬──────┘               └──────┬──────┘
       │                             │
       │         ┌──────────┐        │
       └─────────┤ COMBINED ├────────┘
                 │  SCORING │
                 └─────┬────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ CATEGORY │  │ TEMPORAL │  │ SPATIAL  │
  │  MATCH   │  │PROXIMITY │  │PROXIMITY │
  │          │  │          │  │          │
  │Weight:15%│  │Weight:10%│  │Weight:10%│
  └─────┬────┘  └─────┬────┘  └─────┬────┘
        │             │             │
        └─────────────┴─────────────┘
                      │
                      ▼
           ┌────────────────────┐
           │   TOTAL SCORE      │
           │   (0.00 - 1.00)    │
           └──────────┬─────────┘
                      │
                      ▼
              ┌───────────────┐
              │ Score >= 0.70?│
              └───────┬───────┘
                      │
            ┌─────────┴─────────┐
            │                   │
           NO                  YES
            │                   │
            ▼                   ▼
    ┌──────────────┐    ┌──────────────┐
    │  No Match    │    │ Create Match │
    │  Continue    │    │   Record     │
    │  Searching   │    │ Notify Users │
    └──────────────┘    └──────┬───────┘
                                │
                                ▼
                        ┌──────────────┐
                        │  Verification│
                        │   Required   │
                        └──────────────┘
```

## Verification Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   MATCH CREATED (Score > 70%)                 │
└────────────────────────┬─────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
┌──────────────────┐           ┌──────────────────┐
│  LOST REPORTER   │           │  FOUND REPORTER  │
│  (Set question)  │           │  (Must answer)   │
└──────────────────┘           └────────┬─────────┘
                                        │
                                        ▼
                            ┌────────────────────┐
                            │  Answer Secret     │
                            │  Question          │
                            └──────────┬─────────┘
                                       │
                                       ▼
                            ┌────────────────────┐
                            │  Hash & Compare    │
                            │  with bcrypt       │
                            └──────────┬─────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        │                             │
                    CORRECT                        WRONG
                        │                             │
                        ▼                             ▼
            ┌────────────────────┐       ┌────────────────────┐
            │  ✓ VERIFIED        │       │  ✗ Increment       │
            │                    │       │    Attempts        │
            │  • Update status   │       └──────────┬─────────┘
            │  • Exchange info   │                  │
            │  • Close tickets   │                  ▼
            └────────────────────┘       ┌────────────────────┐
                                         │  Attempts < 3?     │
                                         └──────────┬─────────┘
                                                    │
                                      ┌─────────────┴─────────┐
                                      │                       │
                                     YES                      NO
                                      │                       │
                                      ▼                       ▼
                          ┌────────────────────┐  ┌────────────────────┐
                          │  Allow Retry       │  │  ⚠ ESCALATE TO     │
                          └────────────────────┘  │     ADMIN          │
                                                  │                    │
                                                  │  • Create case     │
                                                  │  • Manual review   │
                                                  │  • Human decision  │
                                                  └────────────────────┘
```

## Database Schema Relationships

```
┌────────────────┐
│     users      │
│───────────────│
│ id (PK)       │
│ email         │◄────────────┐
│ firebase_uid  │             │
│ display_name  │             │
└────────────────┘             │
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
    ┌────────────────┐             ┌────────────────┐
    │  lost_items    │             │  found_items   │
    │───────────────│             │───────────────│
    │ id (PK)       │             │ id (PK)       │
    │ user_id (FK)  │             │ user_id (FK)  │
    │ item_name     │             │ item_name     │
    │ category      │             │ category      │
    │ description   │             │ description   │
    │ location      │             │ location      │
    │ date_lost     │             │ date_found    │
    │ image_url     │             │ image_url     │
    │ image_features│             │ image_features│
    │ secret_q      │             │ secret_detail │
    │ secret_a_hash │             │ status        │
    │ status        │             └───────┬────────┘
    └───────┬────────┘                    │
            │                             │
            │          ┌──────────────────┘
            │          │
            │          │
            └────┬─────┴─────┐
                 │           │
                 ▼           ▼
         ┌────────────────────────┐
         │      matches           │
         │───────────────────────│
         │ id (PK)               │
         │ lost_item_id (FK)     │◄────┐
         │ found_item_id (FK)    │     │
         │ match_score           │     │
         │ image_similarity      │     │
         │ text_similarity       │     │
         │ status                │     │
         │ verification_attempts │     │
         └───────────┬───────────┘     │
                     │                 │
                     ▼                 │
         ┌────────────────────────┐    │
         │    admin_cases         │    │
         │───────────────────────│    │
         │ id (PK)               │    │
         │ match_id (FK)         │────┘
         │ reason                │
         │ resolution            │
         │ status                │
         └────────────────────────┘
```

## Component Hierarchy (Frontend)

```
App
│
├── AuthProvider (Context)
│   │
│   └── Router
│       │
│       ├── Navbar
│       │   ├── Logo
│       │   ├── Navigation Links
│       │   └── User Menu
│       │
│       └── Routes
│           │
│           ├── LoginPage
│           │   ├── Google Sign-in Button
│           │   └── How It Works
│           │
│           ├── PrivateRoute → HomePage
│           │   ├── Welcome Banner
│           │   ├── Feature Cards
│           │   └── Quick Actions
│           │
│           ├── PrivateRoute → ReportPage
│           │   ├── Tabs (Lost/Found)
│           │   ├── ReportLostForm
│           │   │   ├── Item Details
│           │   │   ├── Image Upload
│           │   │   └── Secret Question
│           │   └── ReportFoundForm
│           │       ├── Item Details
│           │       ├── Image Upload
│           │       └── Secret Detail
│           │
│           ├── PrivateRoute → BrowsePage
│           │   ├── Tabs (Lost/Found)
│           │   ├── Search & Filters
│           │   └── Item Grid
│           │       └── Item Cards
│           │
│           ├── PrivateRoute → MatchesPage
│           │   ├── Matches List
│           │   ├── Match Details
│           │   └── Verification Dialog
│           │
│           └── PrivateRoute → MyReportsPage
│               ├── Tabs (Lost/Found)
│               └── My Items Grid
│                   └── Item Cards
```

## Security Layers

```
┌─────────────────────────────────────────────────┐
│               Layer 7: User Interface           │
│  • Input validation                             │
│  • XSS prevention (React escaping)              │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────┐
│           Layer 6: Firebase Authentication      │
│  • Google OAuth                                 │
│  • Email domain restriction                     │
│  • Token-based authentication                   │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────┐
│           Layer 5: API Authorization            │
│  • JWT token verification                       │
│  • User session validation                      │
│  • Rate limiting (100 req/15min)                │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────┐
│           Layer 4: Application Logic            │
│  • Ownership verification                       │
│  • Secret answer hashing (bcrypt)               │
│  • File type/size validation                    │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────┐
│           Layer 3: Database Security            │
│  • Parameterized queries (SQL injection proof)  │
│  • Foreign key constraints                      │
│  • Input sanitization                           │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────┐
│           Layer 2: Network Security             │
│  • HTTPS encryption (TLS 1.3)                   │
│  • CORS policy                                  │
│  • Secure headers                               │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────┐
│           Layer 1: Infrastructure               │
│  • Cloud provider security (Vercel/Render)      │
│  • DDoS protection                              │
│  • Firewall rules                               │
└─────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌───────────────────────────────────────────────────────┐
│                    PRODUCTION                          │
└────────────────────┬──────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
     ▼               ▼               ▼
┌─────────┐    ┌─────────┐    ┌─────────┐
│ Vercel  │    │ Render  │    │Firebase │
│Frontend │    │Backend  │    │  Auth   │
│         │    │         │    │         │
│ • React │    │ • API   │    │ • OAuth │
│ • CDN   │    │ • AI    │    │ • Users │
│ • HTTPS │    │ • HTTPS │    └─────────┘
└────┬────┘    └────┬────┘
     │              │
     │              └────┬─────────────┐
     │                   │             │
     ▼                   ▼             ▼
┌─────────┐       ┌──────────┐  ┌──────────┐
│Cloudinary│       │Supabase │  │ Logging  │
│         │       │PostgreSQL│  │ Sentry   │
│ • Images│       │          │  │          │
│ • CDN   │       │ • Data   │  │ • Errors │
│ • 25GB  │       │ • 500MB  │  │ • Traces │
└─────────┘       └──────────┘  └──────────┘
```

---

All diagrams are in ASCII art format for universal compatibility and easy viewing in any text editor or terminal.
