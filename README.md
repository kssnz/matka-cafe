<<<<<<< HEAD
# Matka Cafe - Cafe Booking & Food Ordering System

A complete MERN stack application for managing a cafe. Customers can explore the menu, book tables, and order food. Admins can manage food items, orders, bookings, and site content.

## Features

### Customer
- **Landing Page:** Modern responsive design with hero section.
- **Explore Menu:** View food items with categories and search.
- **Cart System:** Add/remove items, update quantity, and select table (1-5).
- **Booking System:** Reserve a table with date and time.
- **Checkout:** Simple order submission with name and phone number.

### Admin
- **Dashboard:** Overview of total orders, revenue, and recent activities.
- **Food Management:** CRUD operations for food items with image upload.
- **Order Management:** View and update status (Pending, Preparing, Delivered).
- **Booking Management:** View and manage table reservations.
- **Content Management:** Edit homepage text and hero images.

## Tech Stack
- **Frontend:** React.js, Tailwind CSS, Vite, Context API.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas.
- **Authentication:** JWT (for Admin).
- **Icons:** Lucide-React.
- **Notifications:** React Hot Toast.

## Installation

### Prerequisites
- Node.js installed.
- MongoDB Atlas account.

### Setup
1. Clone the repository.
2. Install root dependencies:
   ```bash
   npm install
   ```
3. Install Backend dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Create `backend/.env` file and add your MongoDB URI and JWT Secret:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   ```
5. Install Frontend dependencies:
   ```bash
   cd ../Frontend
   npm install
   ```
6. Seed initial data (Admin user & sample food):
   ```bash
   cd ..
   npm run seed
   ```

### Running the App
Run both frontend and backend concurrently:
```bash
npm run dev
```

## Admin Credentials
- **Email:** my2056875@gmail.com
- **Password:** Matka123

## Currency
All prices are in **Nepali Rupees (Rs/NPR)**.
=======
# Cafeorder_management
A complete cafe order management system designed to simplify daily cafe operations. This project helps manage customer orders, menu items, billing, inventory, and staff activities efficiently through a user-friendly interface.
>>>>>>> 14b1fb71418c21bf55f31ad04f5faac08e94d6b2
