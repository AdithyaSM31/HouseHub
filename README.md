# 🏠 HouseHub - Property Rental Platform

A modern, full-stack property rental and management application built with React, Node.js, Express, and SQLite. Features real-time messaging, advanced search filters, user authentication, and property management.

---

## ✨ Features

### 🔐 Authentication & User Management
- JWT-based secure authentication
- User registration and login
- Profile management with image upload support
- Password encryption with bcrypt

### 🏘️ Property Management
- Browse properties with advanced filters
- Search by city, property type, price range, bedrooms, furnishing status
- Create, edit, and delete property listings
- Upload multiple property images via URLs
- Featured properties on homepage
- Property details with image gallery
- Owner contact information

### 💾 User Features
- Bookmark/save favorite properties
- User dashboard with property statistics
- Manage personal property listings
- View saved properties

### 💬 Real-Time Messaging
- Direct messaging between users
- Message property owners
- Conversation history
- Unread message indicators
- Socket.IO integration for real-time updates

### 🎨 UI/UX
- Responsive design for all devices
- Modern, clean interface
- Smooth animations and transitions
- Independent scroll for filters sidebar
- Image carousel for property galleries
- Loading states and error handling

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd house-hub
```

2. **Setup Backend**
```bash
cd backend
npm install
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
```

### Running the Application

Open two terminal windows:

**Terminal 1 - Backend (Port 5000)**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend (Port 3000)**
```bash
cd frontend
npm run dev
```

**Access the application:** http://localhost:3000

---

## 📋 Test Credentials

The database includes 3 pre-configured test users:

| Email | Password | Role |
|-------|----------|------|
| john@example.com | password123 | User with 2 listings |
| jane@example.com | password123 | User with properties |
| amit@example.com | password123 | User with properties |

---

## 🗂️ Project Structure

```
house-hub/
├── backend/
│   ├── config/
│   │   └── database.js          # SQLite database configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── propertyController.js # Property CRUD operations
│   │   ├── bookmarkController.js # Bookmark management
│   │   └── messageController.js  # Messaging functionality
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── validate.js          # Request validation
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── properties.js        # Property routes
│   │   ├── bookmarks.js         # Bookmark routes
│   │   └── messages.js          # Message routes
│   ├── scripts/
│   │   └── seedData.js          # Database seeding script
│   ├── househub.db              # SQLite database file
│   ├── server.js                # Express server setup
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/           # Reusable components
    │   │   ├── layout/           # Layout components (Navbar)
    │   │   └── property/         # Property-related components
    │   ├── context/
    │   │   └── AuthContext.jsx   # Authentication context
    │   ├── pages/
    │   │   ├── Auth/             # Login & Signup
    │   │   ├── Home/             # Homepage
    │   │   ├── Properties/       # Browse properties
    │   │   ├── PropertyDetails/  # Property detail view
    │   │   ├── PostProperty/     # Create property
    │   │   ├── EditProperty/     # Edit property
    │   │   ├── Dashboard/        # User dashboard
    │   │   ├── Profile/          # User profile
    │   │   ├── Bookmarks/        # Saved properties
    │   │   └── Messages/         # Messaging interface
    │   ├── services/
    │   │   ├── api.js            # API configuration
    │   │   ├── authService.js    # Auth API calls
    │   │   ├── propertyService.js # Property API calls
    │   │   ├── bookmarkService.js # Bookmark API calls
    │   │   └── messageService.js  # Message API calls
    │   ├── utils/
    │   │   └── helpers.js        # Utility functions
    │   ├── styles/
    │   │   └── global.css        # Global styles
    │   ├── App.jsx               # Main app component
    │   └── main.jsx              # Entry point
    └── package.json
```

---

## 🗄️ Database Schema

### Tables
- **users** - User accounts and profiles
- **properties** - Property listings
- **property_images** - Property image URLs
- **bookmarks** - User saved properties
- **conversations** - Chat conversations
- **messages** - Chat messages

---

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database (better-sqlite3)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Socket.IO** - Real-time messaging
- **express-validator** - Request validation

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Routing
- **React Icons** - Icon library
- **CSS Modules** - Component styling

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Properties
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/featured` - Get featured properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create property (auth required)
- `PUT /api/properties/:id` - Update property (auth required)
- `DELETE /api/properties/:id` - Delete property (auth required)
- `GET /api/properties/user/me` - Get user's properties (auth required)

### Bookmarks
- `GET /api/bookmarks` - Get user bookmarks (auth required)
- `POST /api/bookmarks/:propertyId` - Toggle bookmark (auth required)

### Messages
- `GET /api/messages/conversations` - Get all conversations (auth required)
- `GET /api/messages/conversation/:userId` - Get messages with user (auth required)
- `POST /api/messages` - Send message (auth required)
- `GET /api/messages/unread` - Get unread count (auth required)

---

## 🎯 Key Features Explained

### Property Search & Filters
- **Search** by title, description, or city
- **Filter** by city, property type, listing type, price range, bedrooms, and furnishing status
- **Pagination** support
- **Sort** by latest listings

### Messaging System
- Contact property owners directly from property details
- View all conversations in sidebar
- Real-time message delivery
- Unread message tracking
- Property context in conversations

### User Dashboard
- View all personal property listings
- Quick statistics (total listings, saved properties)
- Edit or delete properties
- One-click navigation to create new listing

---

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt (10 rounds)
- Protected API routes
- Input validation and sanitization
- CORS configuration
- SQL injection prevention with parameterized queries

---

## 🌟 Sample Data

**15 properties** pre-loaded across 5 cities:
- Bangalore (5 properties)
- Mumbai (3 properties)
- Delhi (3 properties)
- Pune (2 properties)
- Hyderabad (2 properties)

All properties include:
- High-quality images from Unsplash
- Detailed descriptions
- Amenities
- Pricing information
- Owner details

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (Backend)
npx kill-port 5000

# Kill process on port 3000 (Frontend)
npx kill-port 3000
```

### Database Issues
```bash
# Reinitialize database
cd backend
node setupSQLite.js
```

### Clear Browser Cache
If you experience login issues, clear browser cache and localStorage.

---

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

---

## � Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

**Quick Links:**
- **Frontend (Vercel)**: Deploy to Vercel using the included `vercel.json`
- **Backend (Render)**: Deploy to Render using the included `render.yaml`

### Production Environment Variables

**Frontend (.env.production)**
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**Backend (Render Environment)**
```
NODE_ENV=production
JWT_SECRET=your-production-secret-key
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
PORT=10000
```

---

## �🚧 Future Enhancements

- [ ] Image upload to cloud storage (Cloudinary/AWS S3)
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Property reviews and ratings
- [ ] Map integration for property locations
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Development

Built with ❤️ using modern web technologies

**Happy House Hunting! 🏡**

All properties include:
- High-quality Unsplash images
- Complete details (bedrooms, bathrooms, amenities)
- Realistic pricing
- Various property types (1BHK, 2BHK, 3BHK, Studio, PG)

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **SQLite** (better-sqlite3) - File-based database
- **JWT** authentication with bcrypt password hashing
- **Socket.IO** for real-time messaging
- **Express Validator** for input validation

### Frontend
- **React 18** with Vite
- **React Router DOM** for routing
- **Context API** for state management

### Database Schema
- `users` - User accounts with hashed passwords
- `properties` - Property listings
- `property_images` - Multiple images per property
- `bookmarks` - Saved properties
- `conversations` - Message threads
- `messages` - Chat messages

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Properties
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/featured` - Get featured properties
- `GET /api/properties/:id` - Get single property
- `GET /api/properties/user/my-listings` - Get user's listings (protected)
- `POST /api/properties` - Create property (protected)
- `PUT /api/properties/:id` - Update property (protected)
- `DELETE /api/properties/:id` - Delete property (protected)

### Bookmarks
- `GET /api/bookmarks` - Get user's bookmarked properties (protected)
- `POST /api/bookmarks/:propertyId` - Toggle bookmark (protected)
- `GET /api/bookmarks/check/:propertyId` - Check if bookmarked (protected)

### Messages
- `GET /api/messages/conversations` - Get all conversations (protected)
- `GET /api/messages/conversation/:userId` - Get messages with user (protected)
- `POST /api/messages` - Send message (protected)
- `GET /api/messages/unread` - Get unread count (protected)

## 🧪 Testing the API

### Login Example
```powershell
$body = @{email='john@example.com'; password='password123'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method POST -Body $body -ContentType 'application/json'
```

### Get Properties
```powershell
Invoke-RestMethod -Uri 'http://localhost:5000/api/properties' -Method GET
```

### Search Properties
```powershell
Invoke-RestMethod -Uri 'http://localhost:5000/api/properties?city=Bangalore&propertyType=apartment' -Method GET
```

## 🔐 Authentication Flow

1. User registers or logs in via `/api/auth/register` or `/api/auth/login`
2. Backend returns JWT token valid for 7 days
3. Frontend stores token in localStorage
4. All protected routes require `Authorization: Bearer <token>` header
5. Backend verifies JWT and adds user info to request

## 💾 Database

- **Type**: SQLite (file-based)
- **Location**: `backend/househub.db`
- **Size**: ~112 KB with sample data
- **Backup**: Simply copy the .db file

### Reset Database
```powershell
cd backend
node setupSQLite.js
```

## 🎨 Sample Images

All property images are from Unsplash.com - free to use real estate photography.

## 🔥 Key Features

### Authentication System
- Secure password hashing with bcrypt
- JWT tokens with 7-day expiry
- Protected routes with middleware

### Property Management
- Create, read, update, delete properties
- Multiple image support per property
- Rich property details (amenities, furnishing, etc.)
- View counter for each property

### Search & Filter
- Search by title, description, or city
- Filter by city, property type, listing type
- Price range filtering
- Bedroom/bathroom filtering

### Bookmarks
- Save favorite properties
- Quick access to saved listings

### Messaging
- Real-time chat with Socket.IO
- Conversation threads
- Unread message counter

## 📝 Notes

- **No Firebase**: Completely removed, using JWT authentication
- **No Cloud Storage**: Images are Unsplash URLs stored directly in database
- **Simple Setup**: Just SQLite file, no PostgreSQL/MySQL installation needed
- **Demonstration Ready**: Pre-loaded with realistic sample data

## 🎯 Perfect For

- Portfolio projects
- Academic demonstrations
- Learning full-stack development
- Prototyping rental platforms

---

**Status**: Fully Functional ✅
**Purpose**: Demonstration & Learning
