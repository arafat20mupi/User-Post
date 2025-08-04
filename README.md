# UserPost App - Complete Social Media Platform

A full-stack social media application built with Node.js, Express, PostgreSQL, and vanilla JavaScript.

## 🚀 Features

### Backend Features
- ✅ User registration and authentication
- ✅ JWT token-based security
- ✅ Password hashing with bcrypt
- ✅ Complete CRUD operations for posts
- ✅ User profile management
- ✅ Post search functionality
- ✅ Pagination support
- ✅ Input validation and sanitization
- ✅ Error handling and logging
- ✅ Database relationships and constraints

### Frontend Features
- ✅ Responsive design
- ✅ User authentication (login/register)
- ✅ Dashboard for managing posts
- ✅ All posts view with search and filter
- ✅ Post creation, editing, and deletion
- ✅ Real-time notifications
- ✅ Modern UI with animations
- ✅ Mobile-friendly interface

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd userpost-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create a `.env` file in the root directory:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=userpost_db
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your-super-secret-jwt-key-here
```

### 4. Setup PostgreSQL database
```bash
# Create database
createdb userpost_db

# Run database setup
npm run setup-db
```

### 5. Start the application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 6. Access the application
- Frontend: http://localhost:5000
- API: http://localhost:5000/api

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile (requires auth)
- `PUT /api/profile` - Update user profile (requires auth)
- `PUT /api/change-password` - Change password (requires auth)

### Posts Endpoints
- `GET /api/posts` - Get all posts (with pagination)
- `GET /api/posts/:id` - Get single post
- `GET /api/posts/user/:userId` - Get posts by user
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post (owner only)
- `DELETE /api/posts/:id` - Delete post (owner only)
- `GET /api/posts/search/:query` - Search posts

### Users Endpoints
- `GET /api/users` - Get all users with post counts
- `GET /api/users/:id` - Get user with their posts
- `GET /api/users/:id/stats` - Get user statistics

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

### Posts Table
```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting
- Secure headers with Helmet

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📁 Project Structure

```
userpost-app/
├── server.js              # Main server file
├── db.js                  # Database configuration
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── posts.js          # Posts routes
│   └── users.js          # Users routes
├── scripts/
│   ├── setup-database.js # Database setup script
│   └── setup-database.sql # SQL setup file
├── public/               # Frontend files
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── all-posts.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── auth.js
│       ├── posts.js
│       └── all-posts.js
├── package.json
├── .env
└── README.md
```

## 🚀 Deployment

### Heroku Deployment
1. Create Heroku app
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy code

### Docker Deployment
```bash
# Build image
docker build -t userpost-app .

# Run container
docker run -p 5000:5000 userpost-app
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Your Name - your.email@example.com

## 🙏 Acknowledgments

- Express.js team
- PostgreSQL community
- Node.js community
```

## 🎉 **সব Features Complete!**

### ✅ **Backend Complete:**
- 🔐 **Authentication** - Register, Login, JWT tokens
- 👥 **User Management** - Profile, password change, user stats
- 📝 **Posts CRUD** - Create, Read, Update, Delete
- 🔍 **Search & Filter** - Advanced search functionality
- 📊 **Pagination** - Efficient data loading
- 🛡️ **Security** - Input validation, SQL injection protection
- 📈 **Statistics** - User and post analytics

### ✅ **Database Complete:**
- 🗄️ **PostgreSQL Schema** - Optimized tables and relationships
- 🔗 **Foreign Keys** - Data integrity
- 📊 **Indexes** - Performance optimization
- 🔄 **Triggers** - Auto-update timestamps
- 📝 **Sample Data** - Ready to test

### ✅ **API Complete:**
- 🌐 **RESTful APIs** - Standard HTTP methods
- 📋 **Comprehensive Endpoints** - All CRUD operations
- 🔒 **Authorization** - Protected routes
- ✅ **Validation** - Input sanitization
- 📄 **Documentation** - Complete API docs

এখন আপনার UserPost App সম্পূর্ণ production-ready! 🚀

