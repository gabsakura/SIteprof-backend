# SIteprof-backend

A backend API for managing teacher profiles and educational content.

## 🚀 Features

- User authentication and authorization
- Teacher profile management
- Course and class scheduling
- Student enrollment system
- Content management system
- Real-time notifications
- File upload and management
- API documentation with Swagger

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- MongoDB
- Git

## 🔧 Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/siteprof-backend.git
cd siteprof-backend
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

## 🛠️ Built With

- Node.js
- Express.js
- SQLite3
- JWT for authentication
- Multer for file uploads
- Bcrypt for password hashing
- CORS for cross-origin resource sharing

## 📚 API Documentation

### Authentication Endpoints

- **POST /auth/login**
  - Login with email and password
  - Returns JWT token

- **POST /api/users/register** (Admin only)
  - Register new users
  - Requires admin authentication

### User Management Endpoints

- **GET /api/users** (Admin only)
  - Get all users

- **GET /api/users/:id**
  - Get specific user details

- **PUT /api/users/:id**
  - Update user profile

- **PUT /api/users/:id/password**
  - Update user password

### Profile Management

- **POST /api/profile/image**
  - Upload profile image

- **GET /api/profile/image/:id**
  - Get user profile image

## 💾 Database Schema

### Users Table
- id (PRIMARY KEY)
- nome (TEXT)
- email (TEXT UNIQUE)
- password (TEXT)
- tipo (TEXT)
- verified (BOOLEAN)
- profile_image_path (TEXT)
- description (TEXT)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## ✨ Authors

* **Your Name** - *Initial work* - [YourGithub](https://github.com/yourusername)

## 📞 Support

For support, email your@email.com or create an issue in this repository.