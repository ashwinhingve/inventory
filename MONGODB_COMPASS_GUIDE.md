# Using MongoDB Compass with Your Application

This guide will help you set up and use MongoDB Compass with your inventory management application.

## Prerequisites
- MongoDB Compass is installed on your system
- The application code is set up and ready to run

## Steps to Connect

### 1. Open MongoDB Compass
- Launch MongoDB Compass from your start menu or desktop shortcut

### 2. Connect to Your Local MongoDB Instance
- In the connection dialog, enter: `mongodb://localhost:27017`
- Click "Connect"
- If MongoDB is not running, Compass will offer to start it for you

### 3. Create the Required Database
- Once connected, click the "+" button next to "Databases"
- Create a new database named `inventory-management`
- Create an initial collection named `users`

### 4. Run Your Application
- Return to your application directory
- Run the application with: `npm run dev`
- The application will connect to your local MongoDB instance

## Troubleshooting

### If the Application Can't Connect to MongoDB:
1. Make sure MongoDB is running through Compass
2. Verify that you've created the `inventory-management` database
3. Check that your `.env.local` file contains the correct connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/inventory-management
   ```

### If You Get Authentication Errors:
- By default, the local MongoDB instance doesn't require authentication
- If you've set up authentication, update your connection string to:
  ```
  MONGODB_URI=mongodb://username:password@localhost:27017/inventory-management
  ```

## Using MongoDB Compass for Database Management

MongoDB Compass provides a graphical interface to:
- View, create, update, and delete documents
- Create and manage indexes
- Analyze query performance
- Import and export data

To view your application data:
1. Open MongoDB Compass
2. Connect to your local MongoDB instance
3. Select the `inventory-management` database
4. Browse collections to view and manage data

## Next Steps

After setting up your database:
1. Create your first user account through the application signup page
2. This will create the necessary collections in your database
3. You can then view these collections in MongoDB Compass 