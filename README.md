# Modern E-commerce Platform

A full-stack e-commerce solution built with modern web technologies, featuring a customer-facing frontend, admin dashboard, and robust backend API.

## 🚀 Features

- **Customer Frontend**
  - Modern, responsive UI built with React and Vite
  - Product browsing and search functionality
  - Shopping cart and checkout process
  - User authentication and profile management
  - Order tracking and history

- **Admin Dashboard**
  - Product management (CRUD operations)
  - Order management and processing
  - User management
  - Analytics and reporting
  - Inventory tracking

- **Backend API**
  - RESTful API built with Node.js and Express
  - MongoDB database integration
  - JWT authentication
  - File upload support with Cloudinary
  - Redis caching
  - Email notifications

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Redux Toolkit & Zustand for state management
- React Query for data fetching
- Ant Design for UI components
- TailwindCSS for styling
- Framer Motion for animations
- React Router for navigation

### Backend
- Node.js (v18+)
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Redis for caching
- Cloudinary for image storage
- Nodemailer for email notifications
- Babel for transpilation

## 📦 Installation

### Prerequisites
- Node.js (v18.19.1 or higher)
- MongoDB
- Redis
- Cloudinary account (for image storage)

### Backend Setup
```bash
cd backend
npm install
# Create .env file with required environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
# Create .env file with required environment variables
npm run dev
```

### Admin Dashboard Setup
```bash
cd admin
npm install
# Create .env file with required environment variables
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
REDIS_URL=your_redis_url
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🚀 Development

### Backend
```bash
npm run dev     # Development mode
npm run build   # Build for production
npm run production  # Run production build
```

### Frontend
```bash
npm run dev     # Development mode
npm run build   # Build for production
npm run preview # Preview production build
```

## 📝 API Documentation

The API documentation is available at `/api-docs` when running the backend server in development mode.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Duy Phuc Dev - Initial work

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the amazing tools and libraries 
