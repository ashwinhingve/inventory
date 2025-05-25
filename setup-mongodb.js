const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('MongoDB Compass Connection Setup Helper');
console.log('=====================================');
console.log('');
console.log('This script will help you set up your MongoDB connection.');
console.log('Since you have MongoDB Compass installed, you can use it to connect to MongoDB.');
console.log('');
console.log('Steps to follow:');
console.log('1. Open MongoDB Compass');
console.log('2. Connect to your local MongoDB instance (usually mongodb://localhost:27017)');
console.log('   - If you haven\'t started MongoDB yet, start it from Compass');
console.log('3. Create a new database called "inventory-management"');
console.log('');

// Check if .env.local exists, if not create it
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env.local file with MongoDB connection string...');
  fs.writeFileSync(envPath, 'MONGODB_URI=mongodb://localhost:27017/inventory-management\nNEXTAUTH_SECRET=your-secret-key-for-next-auth\n');
  console.log('.env.local file created successfully!');
} else {
  console.log('.env.local file already exists. Checking for MongoDB connection string...');
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (!envContent.includes('MONGODB_URI=')) {
    console.log('Adding MongoDB connection string to .env.local...');
    fs.appendFileSync(envPath, '\nMONGODB_URI=mongodb://localhost:27017/inventory-management\n');
    console.log('MongoDB connection string added to .env.local!');
  } else {
    console.log('MongoDB connection string already exists in .env.local.');
  }

  if (!envContent.includes('NEXTAUTH_SECRET=')) {
    console.log('Adding NextAuth secret to .env.local...');
    fs.appendFileSync(envPath, '\nNEXTAUTH_SECRET=your-secret-key-for-next-auth\n');
    console.log('NextAuth secret added to .env.local!');
  }
}

console.log('');
console.log('MongoDB setup complete!');
console.log('');
console.log('To start your application with the local MongoDB connection:');
console.log('1. Make sure MongoDB is running through Compass');
console.log('2. Run "npm run dev" to start your application');
console.log('');
console.log('If you encounter any issues, please ensure that:');
console.log('1. MongoDB Compass is open and connected to mongodb://localhost:27017');
console.log('2. You\'ve created the "inventory-management" database in Compass');
console.log('');

// Try to open MongoDB Compass if it's installed in the default location
console.log('Attempting to open MongoDB Compass...');
const compassPaths = [
  'C:\\Program Files\\MongoDB Compass\\MongoDBCompass.exe',
  'C:\\Program Files (x86)\\MongoDB Compass\\MongoDBCompass.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Programs', 'MongoDB Compass', 'MongoDBCompass.exe')
];

let compassFound = false;
for (const compassPath of compassPaths) {
  if (fs.existsSync(compassPath)) {
    console.log(`Found MongoDB Compass at: ${compassPath}`);
    console.log('Launching MongoDB Compass...');
    exec(`"${compassPath}"`, (error) => {
      if (error) {
        console.error(`Error launching MongoDB Compass: ${error.message}`);
      }
    });
    compassFound = true;
    break;
  }
}

if (!compassFound) {
  console.log('Could not find MongoDB Compass in the default installation paths.');
  console.log('Please open MongoDB Compass manually.');
} 