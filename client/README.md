# E-commerce Platform

A full-stack e-commerce application built with Express.js backend and React frontend, featuring comprehensive product management, user authentication, shopping cart functionality, and admin dashboard.

## 🚀 Features

### Customer Features

- **User Authentication**: Registration, login, and profile management
- **Product Browsing**: Browse products by categories with search and filtering
- **Shopping Cart**: Add/remove items, update quantities
- **Checkout Process**: Secure checkout with address management
- **Order Management**: View order history and track order status
- **Product Reviews**: Rate and review purchased products

### Admin Features

- **Dashboard**: Real-time system status and analytics
- **Product Management**: CRUD operations for products and categories
- **Order Management**: View and update order statuses
- **User Management**: Manage customer accounts and permissions
- **Payment Tracking**: Monitor payment transactions and statuses
- **Review Moderation**: Manage customer reviews

## 🛠️ Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Passport.js** - Authentication middleware
- **Express Session** - Session management
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing

### Frontend

- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library
- **Vite** - Build tool and dev server

## 📁 Project Structure

```
ecommerce-platform/
├── backend/
│   ├── controllers/          # Route controllers
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── config/              # Configuration files
│   ├── public/              # Static files
│   └── app.js               # Express app setup
├── frontend/
│   ├── src/
│   │   ├── api/             # API service functions
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Page components
│   │   │   └── admin/       # Admin panel pages
│   │   ├── types/           # TypeScript type definitions
│   │   └── main.tsx         # App entry point
│   ├── public/              # Static assets
│   └── package.json         # Dependencies
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ecommerce-platform
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the backend directory:

   ```env
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   CLIENT_URL=http://localhost:3000
   SESSION_SECRET=your-session-secret-key
   JWT_SECRET=your-jwt-secret-key
   PORT=5000
   ```

4. **Start the backend server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

### Frontend Setup

1. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the frontend directory:

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start the frontend development server**
   ```bash
   npm run dev
   ```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📊 Database Models

### User Model

- Personal information (name, email, phone)
- Authentication credentials
- Role-based permissions (customer/admin)
- Address management

### Product Model

- Product details (name, description, price)
- Category association
- Inventory management
- Image URLs
- Featured/status flags

### Order Model

- Customer information
- Order items and quantities
- Payment and shipping details
- Order status tracking
- Timestamps

### Category Model

- Category hierarchy
- Name and description
- Associated image

### Review Model

- Product ratings and comments
- User association
- Moderation status

### Payment Model

- Transaction tracking
- Payment method details
- Status management
- Order association

## 🔐 Authentication & Authorization

The application uses a hybrid authentication approach:

- **Session-based authentication** for web interface
- **JWT tokens** for API access
- **Role-based access control** (Customer/Admin)
- **Protected routes** for authenticated users
- **Admin-only sections** for management features

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode Ready**: CSS variables for easy theme switching
- **Loading States**: Skeleton loaders and spinners
- **Toast Notifications**: User feedback for actions
- **Form Validation**: Client-side and server-side validation
- **Search & Filtering**: Advanced product discovery
- **Pagination**: Efficient data loading

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders

- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status (Admin)

### Cart

- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove cart item

## 🚀 Deployment

### Backend Deployment

1. Set up MongoDB Atlas or your preferred database
2. Configure environment variables for production
3. Deploy to platforms like Heroku, Railway, or DigitalOcean
4. Update CORS settings for production domain

### Frontend Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy to platforms like Vercel, Netlify, or AWS S3
3. Update API URL environment variable

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- Payment integration is currently simulated (integrate with Stripe/PayPal for production)
- Email notifications are not implemented
- Image upload functionality needs cloud storage integration

## 🔮 Future Enhancements

- [ ] Real payment gateway integration
- [ ] Email notification system
- [ ] Advanced analytics dashboard
- [ ] Inventory management alerts
- [ ] Multi-language support
- [ ] Mobile app development
- [ ] Social media integration
- [ ] Advanced search with Elasticsearch

## 📞 Support

For support and questions, please open an issue in the GitHub repository or contact the development team.

---

**Happy Shopping! 🛒**

```

```
