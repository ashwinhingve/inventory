# Inventory Management System

A comprehensive inventory management system built with Next.js and MongoDB. This system provides tools for managing products, tracking stock levels, processing sales and purchases, and monitoring inventory health.

## Features

- **Product Management**: Add, edit, and delete products with detailed information
- **Stock Tracking**: Real-time tracking of inventory levels
- **Low Stock Alerts**: Automatic alerts when inventory falls below threshold
- **Sales & Purchase Management**: Record sales and purchase transactions
- **Barcode Support**: Generate and scan barcodes for products
- **Multi-store Support**: Manage inventory across multiple locations
- **Reporting & Analytics**: Generate reports and visualize data

## Technologies Used

- **Frontend**: Next.js, Tailwind CSS, React Icons
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **UI Components**: Custom components with Tailwind CSS

## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/inventory-management.git
cd inventory-management
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/inventory-management
NEXTAUTH_SECRET=your-secret-key-for-jwt
NEXTAUTH_URL=http://localhost:3000
```

4. **Run MongoDB**

Ensure MongoDB is running on your system or use a MongoDB cloud service.

5. **Start the development server**

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Demo Credentials

For testing purposes, you can use the following demo credentials:

- **Email**: admin@example.com
- **Password**: password123

## License

MIT

## Credits

Inspired by various inventory management systems including [Stock Register](https://web.stockregister.in).
