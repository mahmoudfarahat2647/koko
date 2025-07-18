# PROMPTBOX Backend Requirements

## 📋 Project Overview

**Project Name:** PROMPTBOX  
**Frontend:** Next.js 15 with TypeScript and Tailwind CSS  
**Backend Requirements:** Express.js + PostgreSQL + TypeScript  
**Authentication:** Multi-provider (GitHub, Google, Email/Password)  
**API Type:** RESTful API with proper CORS configuration  

## 🎯 System Architecture

### Tech Stack Requirements
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18+
- **Database:** PostgreSQL 15+
- **ORM:** Prisma 5+ (recommended) or TypeORM
- **Language:** TypeScript 5+
- **Authentication:** JWT + OAuth 2.0 (GitHub, Google)
- **File Storage:** Local storage or AWS S3 (for future attachments)
- **Environment:** Docker support recommended

### Server Configuration
- **Port:** 8000 (default) or configurable via environment
- **CORS:** Enable for frontend origin (`http://localhost:3001`)
- **Rate Limiting:** 100 requests per minute per IP
- **Security:** Helmet.js, express-rate-limit, bcryptjs
- **Logging:** Morgan + Winston for production
- **Validation:** Zod or Joi for request validation

---

## 🗄️ Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL for OAuth users
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    provider VARCHAR(50) DEFAULT 'email', -- 'email', 'github', 'google'
    provider_id VARCHAR(255), -- Provider's user ID
    theme_preference VARCHAR(20) DEFAULT 'light', -- 'light', 'dark', 'system'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Categories Table
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280', -- Hex color
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Prompts Table
```sql
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    format VARCHAR(20) DEFAULT 'json', -- 'json', 'markdown', 'xml', 'yaml', 'csv'
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Prompt Content Table
```sql
CREATE TABLE prompt_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'prompt', 'example', 'howToUse'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(prompt_id, content_type)
);
```

### 5. Tags Table
```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#00bcff', -- All tags use same color
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Prompt Tags Junction Table
```sql
CREATE TABLE prompt_tags (
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (prompt_id, tag_id)
);
```

### 7. User Sessions Table (JWT Blacklist)
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. Default Data Seeds
```sql
-- Default Categories
INSERT INTO categories (name, description, is_default) VALUES 
('writing', 'Creative writing and storytelling prompts', true),
('frontend', 'Frontend development and UI/UX prompts', true),
('backend', 'Backend development and API prompts', true),
('vibe', 'Brand and marketing prompts', true),
('artist', 'Creative and artistic prompts', true),
('general', 'General purpose prompts', true);

-- Default Tags (all with #00bcff color)
INSERT INTO tags (name, color) VALUES 
('chatgpt', '#00bcff'),
('super', '#00bcff'),
('prompt', '#00bcff'),
('work', '#00bcff'),
('vit', '#00bcff');
```

---

## 🔐 Authentication System

### OAuth Configuration
```typescript
// Required OAuth Apps Configuration
interface OAuthConfig {
  github: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
}
```

### JWT Configuration
```typescript
interface JWTConfig {
  secret: string; // 256-bit secret key
  expiresIn: string; // '24h'
  refreshExpiresIn: string; // '7d'
}
```

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## 🚀 API Endpoints

### Base URL: `http://localhost:8000/api/v1`

### Authentication Endpoints

#### POST `/auth/register`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar_url": null,
      "theme_preference": "light"
    },
    "token": "jwt_token_here",
    "refresh_token": "refresh_token_here"
  }
}
```

#### POST `/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
**Response:** Same as register

#### GET `/auth/github`
Redirect to GitHub OAuth

#### GET `/auth/github/callback`
Handle GitHub OAuth callback

#### GET `/auth/google`
Redirect to Google OAuth

#### GET `/auth/google/callback`
Handle Google OAuth callback

#### POST `/auth/refresh`
**Request:**
```json
{
  "refresh_token": "refresh_token_here"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "refresh_token": "new_refresh_token"
  }
}
```

#### POST `/auth/logout`
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### User Endpoints

#### GET `/users/profile`
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "theme_preference": "dark",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT `/users/profile`
**Headers:** `Authorization: Bearer <token>`
**Request:**
```json
{
  "name": "John Updated",
  "theme_preference": "dark"
}
```
**Response:** Updated user object

### Categories Endpoints

#### GET `/categories`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "writing",
      "description": "Creative writing and storytelling prompts",
      "color": "#6B7280",
      "is_default": true
    }
  ]
}
```

#### POST `/categories`
**Headers:** `Authorization: Bearer <token>`
**Request:**
```json
{
  "name": "custom-category",
  "description": "My custom category",
  "color": "#FF5733"
}
```

### Tags Endpoints

#### GET `/tags`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "chatgpt",
      "color": "#00bcff",
      "usage_count": 15
    }
  ]
}
```

#### POST `/tags`
**Headers:** `Authorization: Bearer <token>`
**Request:**
```json
{
  "name": "new-tag"
}
```
**Response:** Created tag object

### Prompts Endpoints

#### GET `/prompts`
**Query Parameters:**
- `search` (string): Search in title/description
- `category` (string): Filter by category name
- `tag` (string): Filter by tag name
- `user_id` (uuid): Filter by user (optional)
- `is_public` (boolean): Filter public prompts
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `sort` (string): Sort by 'created_at', 'updated_at', 'rating', 'usage_count'
- `order` (string): 'asc' or 'desc' (default: 'desc')

**Response:**
```json
{
  "success": true,
  "data": {
    "prompts": [
      {
        "id": "uuid",
        "title": "Creative Writing Prompt",
        "description": "Generate engaging stories with unique characters and plot twists",
        "category": {
          "id": "uuid",
          "name": "writing",
          "color": "#6B7280"
        },
        "tags": [
          {
            "id": "uuid",
            "name": "chatgpt",
            "color": "#00bcff"
          }
        ],
        "rating": 4,
        "format": "json",
        "is_public": true,
        "usage_count": 25,
        "user": {
          "id": "uuid",
          "name": "John Doe",
          "avatar_url": "https://example.com/avatar.jpg"
        },
        "content": [
          {
            "content_type": "prompt",
            "content": "Write a story about..."
          },
          {
            "content_type": "example",
            "content": "Example output..."
          },
          {
            "content_type": "howToUse",
            "content": "Instructions..."
          }
        ],
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "total_pages": 8,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### GET `/prompts/:id`
**Response:** Single prompt object with full details

#### POST `/prompts`
**Headers:** `Authorization: Bearer <token>`
**Request:**
```json
{
  "title": "New Prompt",
  "description": "Description of the prompt",
  "category_id": "uuid",
  "tags": ["chatgpt", "work"], // Tag names, will create if not exists
  "format": "json",
  "is_public": false,
  "content": {
    "prompt": "The main prompt content",
    "example": "Example output",
    "howToUse": "How to use this prompt"
  }
}
```
**Response:** Created prompt object

#### PUT `/prompts/:id`
**Headers:** `Authorization: Bearer <token>`
**Request:** Same as POST
**Response:** Updated prompt object
**Note:** Only prompt owner can update

#### DELETE `/prompts/:id`
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "message": "Prompt deleted successfully"
}
```
**Note:** Only prompt owner can delete

#### PUT `/prompts/:id/rating`
**Headers:** `Authorization: Bearer <token>`
**Request:**
```json
{
  "rating": 5
}
```
**Response:** Updated prompt object

#### POST `/prompts/:id/copy`
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "data": {
    "copied_content": "Prompt title: Description"
  }
}
```

#### POST `/prompts/:id/usage`
**Headers:** `Authorization: Bearer <token>` (optional)
**Response:**
```json
{
  "success": true,
  "data": {
    "usage_count": 26
  }
}
```

---

## 🛡️ Security Requirements

### Input Validation
- All inputs must be validated using Zod/Joi schemas
- SQL injection prevention through parameterized queries
- XSS protection with proper sanitization
- Rate limiting on all endpoints
- File upload validation (if implemented)

### Authentication Middleware
```typescript
// Protect routes that require authentication
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Verify JWT token
  // Add user info to req.user
  // Handle token expiration
}

// Optional authentication (for public endpoints with user-specific data)
const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  // Same as above but doesn't reject unauthenticated requests
}
```

### Authorization Rules
- Users can only modify their own prompts
- Users can only delete their own prompts
- Public prompts are readable by everyone
- Private prompts are only accessible by owner
- Admin role for category management (future feature)

---

## 📊 Database Indexing

### Performance Indexes
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);

-- Prompt searches
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_category_id ON prompts(category_id);
CREATE INDEX idx_prompts_public ON prompts(is_public);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_prompts_rating ON prompts(rating DESC);
CREATE INDEX idx_prompts_usage ON prompts(usage_count DESC);

-- Full-text search
CREATE INDEX idx_prompts_search ON prompts USING gin(to_tsvector('english', title || ' ' || description));

-- Tag searches
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_prompt_tags_prompt_id ON prompt_tags(prompt_id);
CREATE INDEX idx_prompt_tags_tag_id ON prompt_tags(tag_id);

-- Session management
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

---

## 🔄 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {}, // Response data
  "message": "Optional success message",
  "meta": {} // Optional metadata (pagination, etc.)
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  }
}
```

### Error Codes
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_SERVER_ERROR` (500)

---

## 🧪 Testing Requirements

### Unit Tests
- All service functions
- Database models
- Validation schemas
- Authentication middleware
- Error handling

### Integration Tests
- API endpoints
- Database operations
- OAuth flows
- JWT token management

### Test Data
- Seed data for development
- Test database setup
- Mock OAuth responses
- Test user accounts

### Coverage Requirements
- Minimum 80% code coverage
- All critical paths tested
- Error scenarios covered

---

## 📦 Environment Configuration

### Required Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/promptbox
DATABASE_SSL=false

# Server
NODE_ENV=development
PORT=8000
CORS_ORIGIN=http://localhost:3001

# JWT
JWT_SECRET=your-super-secret-jwt-key-256-bits
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:8000/api/v1/auth/github/callback

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload (Future)
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf

# Email (Future)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🚀 Development Setup

### Prerequisites
```bash
# Required software
Node.js 18+
PostgreSQL 15+
Git
Docker (optional)
```

### Setup Steps
```bash
# 1. Clone and setup
git clone <backend-repo>
cd promptbox-backend
npm install

# 2. Database setup
createdb promptbox_dev
createdb promptbox_test

# 3. Environment setup
cp .env.example .env
# Edit .env with your values

# 4. Database migration
npm run migrate
npm run seed

# 5. Start development server
npm run dev
```

### Scripts
```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "migrate": "prisma migrate dev",
    "seed": "prisma db seed",
    "generate": "prisma generate"
  }
}
```

---

## 📈 Performance Requirements

### Response Times
- Authentication: < 200ms
- Prompt listing: < 300ms
- Prompt creation: < 500ms
- Search queries: < 400ms
- Database queries: < 100ms

### Scalability
- Support 1000+ concurrent users
- Handle 10k+ prompts efficiently
- Pagination for large datasets
- Database connection pooling
- Redis caching (future enhancement)

### Monitoring
- Request logging
- Error tracking
- Performance metrics
- Database query monitoring
- Health check endpoints

---

## 🔮 Future Enhancements

### Phase 2 Features
- **File Attachments**: Support for images, documents
- **Prompt Templates**: Reusable prompt templates
- **Collections**: Organize prompts into collections
- **Comments**: User comments on prompts
- **Likes**: Like/unlike prompts
- **Sharing**: Share prompts with specific users

### Phase 3 Features
- **AI Integration**: OpenAI API integration
- **Prompt Testing**: Test prompts with AI models
- **Analytics**: Usage analytics and insights
- **Export**: Export prompts in various formats
- **Backup**: Automated backup system
- **Admin Dashboard**: Admin interface

### Technical Improvements
- **Caching**: Redis for frequently accessed data
- **Search**: Elasticsearch for advanced search
- **CDN**: Content delivery network for assets
- **WebSocket**: Real-time updates
- **Microservices**: Split into smaller services

---

## 📋 Delivery Checklist

### Core Requirements ✅
- [ ] Database schema created and migrated
- [ ] Authentication system (JWT + OAuth)
- [ ] All CRUD operations for prompts
- [ ] Search and filtering functionality
- [ ] Input validation and sanitization
- [ ] Error handling and logging
- [ ] API documentation
- [ ] Unit and integration tests
- [ ] Docker configuration
- [ ] Environment setup guide

### Security ✅
- [ ] JWT token management
- [ ] Password hashing
- [ ] OAuth integration (GitHub, Google)
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection

### Performance ✅
- [ ] Database indexing
- [ ] Query optimization
- [ ] Pagination implementation
- [ ] Response time optimization
- [ ] Connection pooling
- [ ] Caching strategy

### Documentation ✅
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Database schema documentation
- [ ] Setup and deployment guide
- [ ] Environment configuration guide
- [ ] Testing guide
- [ ] Troubleshooting guide

---

## 🤝 API Integration Guide

### Frontend Integration Points
```typescript
// Frontend API client configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Authentication header
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

// Example API calls
const api = {
  auth: {
    login: (credentials) => fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }),
    logout: () => fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
  },
  prompts: {
    list: (params) => fetch(`${API_BASE_URL}/prompts?${new URLSearchParams(params)}`, {
      headers: getAuthHeaders()
    }),
    create: (data) => fetch(`${API_BASE_URL}/prompts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }),
    update: (id, data) => fetch(`${API_BASE_URL}/prompts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }),
    delete: (id) => fetch(`${API_BASE_URL}/prompts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
  }
};
```

---

## 🔧 Deployment Configuration

### Production Environment
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/promptbox
    depends_on:
      - db
      - redis
    
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=promptbox
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Health Checks
```typescript
// Health check endpoints
GET /health - Basic health check
GET /health/db - Database connection check
GET /health/redis - Redis connection check (if implemented)
```

---

This comprehensive requirements document provides all the necessary information for a backend developer to implement the PROMPTBOX API. The specification includes database schema, API endpoints, security requirements, and integration guidelines that match your frontend implementation perfectly.

**Key Features Covered:**
- Complete CRUD operations for prompts
- Multi-provider authentication (GitHub, Google, Email)
- Advanced search and filtering
- Tag and category management
- User management and preferences
- Security and performance best practices
- Future enhancement roadmap

The backend developer can use this document to build a robust, scalable API that seamlessly integrates with your Next.js frontend. 🚀
