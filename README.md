# 💰 Finance Tracker

A modern, full-stack financial management application with role-based access control, real-time analytics, and comprehensive transaction tracking.

---

## ✨ Features

### Core Functionality
- **User Authentication & Authorization**: Secure JWT-based authentication with role-based access control
- **Transaction Management**: Create, read, update, and delete financial transactions
- **Analytics Dashboard**: Visual insights with line charts, pie charts, and bar charts
- **Advanced Filtering**: Search and filter transactions by category and date range
- **Pagination & Virtual Scrolling**: Optimized rendering for large datasets
- **Category Management**: Organize transactions by multiple categories
- **Real-time Balance Tracking**: Monitor income and expenses in real-time

### Security Features
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Server-side validation with express-validator
- **XSS Protection**: Input sanitization to prevent injection attacks
- **CORS Enabled**: Secure cross-origin resource sharing
- **Helmet.js**: HTTP security headers
- **Password Hashing**: bcryptjs for secure password storage

### User Roles
- **Admin**: Full access to all features and user management
- **User**: Full transaction access with personal data control
- **Read-Only**: View-only access to transactions and analytics

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI component library
- **Vite** - Next-generation build tool
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Recharts** - Data visualization library
- **CSS3** - Styling with theme support (light/dark mode)

### Backend
- **Node.js & Express** - Server and API framework
- **PostgreSQL** - Primary database
- **Redis** - Caching layer
- **JWT** - Authentication tokens
- **express-validator** - Input validation
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **express-rate-limit** - API rate limiting

### Development Tools
- **Nodemon** - Auto-restart for backend development
- **ESLint** - Code linting for frontend

---

## 📁 Project Structure

```
finance-tracker/
├── frontend/                          # React + Vite application
│   ├── src/
│   │   ├── api/                       # API client configuration
│   │   ├── auth/                      # Authentication context
│   │   ├── components/                # Reusable UI components
│   │   ├── constants/                 # Application constants
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── pages/                     # Page components (routes)
│   │   ├── styles/                    # Global stylesheets
│   │   ├── theme/                     # Theme context (light/dark)
│   │   ├── utils/                     # Utility functions
│   │   ├── App.jsx                    # Root component
│   │   └── main.jsx                   # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/                           # Node.js + Express API
│   ├── src/
│   │   ├── config/                    # Configuration files
│   │   │   ├── db.js                  # Database connection
│   │   │   ├── env.js                 # Environment variables
│   │   │   └── redis.js               # Redis cache setup
│   │   ├── controllers/               # Route handlers
│   │   │   ├── authController.js
│   │   │   ├── transactionController.js
│   │   │   ├── analyticsController.js
│   │   │   └── userController.js
│   │   ├── db/                        # Database setup
│   │   │   ├── init.js                # Database initializer
│   │   │   └── schema.sql             # Database schema
│   │   ├── middleware/                # Express middleware
│   │   │   ├── auth.js                # JWT authentication
│   │   │   ├── error.js               # Error handling
│   │   │   ├── rateLimit.js           # Rate limiting
│   │   │   ├── rbac.js                # Role-based access control
│   │   │   ├── sanitize.js            # Input sanitization
│   │   │   └── validate.js            # Request validation
│   │   ├── routes/                    # API route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── transactionRoutes.js
│   │   │   ├── analyticsRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── utils/                     # Utility functions
│   │   │   ├── cache.js               # Caching utilities
│   │   │   ├── httpError.js           # Error handling
│   │   │   └── jwt.js                 # JWT utilities
│   │   ├── app.js                     # Express app setup
│   │   └── server.js                  # Server entry point
│   ├── package.json
│   └── .env.example
│
├── README.md
├── FRONTEND_STATUS.md
└── REQUIREMENT_COVERAGE.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **PostgreSQL** (local or remote instance)
- **Redis** (optional, for caching)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/finance-tracker.git
cd finance-tracker
```

#### 2. Backend Setup

```bash
cd backend

# Copy environment file
copy .env.example .env

# Install dependencies
npm install

# Initialize database (creates tables and schema)
npm run db:init

# Start development server
npm run dev
```

**Backend runs on**: `http://localhost:5000/api`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs on**: `http://localhost:5173`

---

## 🔧 Environment Variables

Create a `.env` file in the backend folder with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_tracker
DB_USER=postgres
DB_PASSWORD=your_password

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173

# API Base URL (Frontend)
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Health Check
```
GET /api/health
```

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password",
  "role": "user"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { /* user object */ }
}
```

### Transaction Endpoints

#### Get All Transactions
```
GET /api/transactions
Authorization: Bearer <token>
```

#### Create Transaction
```
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "expense",
  "amount": 50.00,
  "category": "Food",
  "description": "Lunch",
  "date": "2024-03-04"
}
```

#### Update Transaction
```
PUT /api/transactions/:id
Authorization: Bearer <token>
```

#### Delete Transaction
```
DELETE /api/transactions/:id
Authorization: Bearer <token>
```

### Analytics Endpoints

#### Dashboard Analytics
```
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

#### Category Breakdown
```
GET /api/analytics/categories
Authorization: Bearer <token>
```

#### Yearly Spending
```
GET /api/analytics/yearly
Authorization: Bearer <token>
```

### User Endpoints

#### Get Current User
```
GET /api/users/me
Authorization: Bearer <token>
```

#### Update User Profile
```
PUT /api/users/profile
Authorization: Bearer <token>
```

---

## 🔐 Role-Based Access Control (RBAC)

The application implements three user roles with specific permissions:

| Feature | Admin | User | Read-Only |
|---------|-------|------|-----------|
| View Transactions | ✅ | ✅ | ✅ |
| Create Transaction | ✅ | ✅ | ❌ |
| Edit Transaction | ✅ | ✅ | ❌ |
| Delete Transaction | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ |
| System Admin | ✅ | ❌ | ❌ |

---

## 🛠️ Development Guide

### Running Both Frontend & Backend

**Terminal 1: Backend**
```bash
cd backend
npm run dev
```

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
```

### Building for Production

**Frontend**
```bash
cd frontend
npm run build
```

**Backend**
```bash
# Backend runs directly with Node.js
npm run start
```

### Code Style & Linting

**Frontend ESLint**
```bash
cd frontend
npm run lint
```

---

## 🧪 Testing & Quality

- Input validation on both client and server
- XSS protection via input sanitization
- Rate limiting on sensitive endpoints
- Comprehensive error handling
- Try-catch blocks for async operations

---

## 🤝 Contributing

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Keep commits atomic and descriptive
   - Follow existing code style and patterns
   - Test changes locally before committing

3. **Commit with Clear Messages**
   ```bash
   git commit -m "feat: add user profile update feature"
   ```

4. **Push to Repository**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Ensure all tests pass

### Commit Message Guidelines
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `refactor:` for code refactoring
- `test:` for test additions
- `chore:` for configuration changes

---

## 📋 Checklist for GitHub

- ✅ Well-organized GitHub repository
- ✅ Clear README with setup instructions
- ✅ Separate frontend and backend folders
- ✅ Comprehensive API documentation
- ✅ Environment variables example (.env.example)
- ✅ Development guidelines
- ✅ Role-based access control documentation

---

### Common Solutions
1. Clear node_modules: `rm -r node_modules && npm install`
2. Restart dev servers after env changes
3. Check `.env` file has correct credentials

---
