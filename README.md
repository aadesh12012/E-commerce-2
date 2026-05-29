# E-commerce Platform

A full-stack e-commerce application built with React, Node.js, Express, and MongoDB. The platform supports three user roles: customers, sellers, and admins, with a complete authentication system and product management.

## Features

### Customer Features
- User registration and login
- Browse and search products in real-time
- Add products to cart
- Checkout with payment processing
- Order tracking and history
- Responsive product listing

### Seller Features
- Seller registration and authentication
- Add and manage products
- View orders received
- Track earnings
- Payout details management
- Seller dashboard

### Admin Features
- Admin panel for system management
- User and seller management
- Order monitoring
- Platform analytics

## Tech Stack

**Frontend:**
- React + Vite
- React Router for navigation
- Axios for API calls
- CSS for styling

**Backend:**
- Node.js + Express
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

## Project Structure

```
authproject/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── assets/        # Images and static files
│   │   └── App.jsx        # Main app component
│   └── package.json
├── backend/               # Node.js backend
│   ├── controller/        # Business logic
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middlewares/      # Auth middleware
│   └── config/           # Database config
└── .gitignore
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/aadesh12012/E-commerce.git
cd E-commerce
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file
# Add these variables:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET_USER=your_jwt_secret
# JWT_SECRET_SELLER=your_seller_jwt_secret

npm start
```

3. **Frontend Setup**
```bash
cd client
npm install
npm run dev
```

The application will run on:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## API Endpoints

### Authentication
- `POST /register` - User registration
- `POST /login` - User login
- `POST /seller/register` - Seller registration
- `POST /sellerlogin` - Seller login

### Products
- `GET /products` - Get all products
- `POST /addproduct` - Add product (seller only)

### Cart
- `GET /cart` - Get cart items
- `POST /addcart` - Add to cart
- `DELETE /cart/:id` - Remove from cart

### Orders
- `POST /checkout` - Create order
- `GET /orders` - Get user orders
- `GET /seller/orders` - Get seller orders (seller only)

## Usage

### For Customers
1. Register a new account
2. Browse products using the search bar
3. Add items to cart
4. Proceed to checkout
5. Complete payment
6. Track your orders

### For Sellers
1. Register as a seller
2. Login to seller dashboard
3. Add your products
4. Monitor orders and earnings
5. Update payout details for payments

## Deployment

### Prerequisites for Deployment
- Ensure all `.env` files are properly configured (see `.env.example` files)
- MongoDB instance running (Atlas or self-hosted)
- Node.js environment on deployment server
- Frontend build artifacts

### Backend Deployment

1. **Set Environment Variables**
   - Copy `.env.example` to `.env`
   - Update all values for production

2. **Install Production Dependencies**
```bash
cd backend
npm install --production
```

3. **Start Production Server**
```bash
NODE_ENV=production npm start
```

### Frontend Deployment

1. **Build for Production**
```bash
cd client
npm run build
```

2. **Deploy Built Files**
   - Upload the contents of `dist/` folder to your hosting provider
   - Configure your web server to serve `index.html` for all routes

### Environment Configuration

**Backend (.env):**
- `NODE_ENV=production`
- `PORT=3000` (or your server port)
- `MONGO_URL=` (production MongoDB URI)
- `JWT_SECRET=` (strong secret key)
- `FRONTEND_URLS=` (comma-separated frontend URLs)
- `KEY_ID=` (Razorpay API key)
- `KEY_SECRET=` (Razorpay API secret)
- Email configuration variables

**Frontend (.env):**
- `VITE_API_BASE_URL=` (production backend URL)
- `VITE_ENVIRONMENT=production`

### Hosting Options
- **Backend:** Heroku, Railway, AWS EC2, DigitalOcean, Render
- **Frontend:** Vercel, Netlify, AWS S3 + CloudFront, GitHub Pages
- **Database:** MongoDB Atlas, AWS DocumentDB

## Features Implemented

✅ User authentication with JWT
✅ Real-time product search
✅ Shopping cart functionality
✅ Order management system
✅ Seller dashboard
✅ Admin panel
✅ Payment processing
✅ Responsive design
✅ Seller registration
✅ Password hashing with bcrypt

## Future Enhancements

- Product reviews and ratings
- Wishlist feature
- Order notifications
- Advanced analytics
- Inventory management
- Multiple payment methods

## Contributing

Feel free to fork this project and submit pull requests with improvements.

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please open an issue on GitHub.

---

**Note:** Make sure to configure your MongoDB connection and environment variables before running the application.
