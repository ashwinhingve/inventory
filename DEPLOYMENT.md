# Deployment Guide for Ubuntu VPS

## Prerequisites

- Ubuntu 20.04+ VPS
- Node.js 20.x
- MongoDB (local or Atlas)
- PM2 for process management
- (Optional) Nginx for reverse proxy

## Quick Start

### 1. Install Dependencies on VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install MongoDB (if hosting locally)
# Follow: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
```

### 2. Clone and Setup Application

```bash
# Navigate to web directory
cd /var/www

# Clone your repository
git clone <your-repo-url> inventory-management
cd inventory-management

# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

### 3. Configure Environment Variables

Edit `.env.local` with your production values:

```env
# Database - Use your production MongoDB URI
MONGODB_URI=mongodb://localhost:27017/inventory-management
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory-management

# Generate new secrets (run: openssl rand -hex 32)
NEXTAUTH_SECRET=<your-generated-secret>
JWT_SECRET=<your-generated-secret>

# Your VPS domain or IP
NEXTAUTH_URL=http://your-vps-ip-or-domain
# For HTTPS: NEXTAUTH_URL=https://your-domain.com

# Production environment
NODE_ENV=production
```

### 4. Build and Deploy

```bash
# Install dependencies
npm ci

# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs
```

### 5. Verify Deployment

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs inventory-management

# Monitor application
pm2 monit
```

## Optional: Nginx Reverse Proxy

### Install Nginx

```bash
sudo apt install nginx -y
```

### Configure Nginx

Create `/etc/nginx/sites-available/inventory-management`:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/inventory-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Security Recommendations

1. **Generate Strong Secrets**:
   ```bash
   openssl rand -hex 32  # Run twice for NEXTAUTH_SECRET and JWT_SECRET
   ```

2. **Setup Firewall**:
   ```bash
   sudo ufw allow 22      # SSH
   sudo ufw allow 80      # HTTP
   sudo ufw allow 443     # HTTPS
   sudo ufw enable
   ```

3. **SSL Certificate** (with Let's Encrypt):
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your-domain.com
   ```

4. **MongoDB Security**:
   - Enable authentication
   - Use strong passwords
   - Bind to localhost if MongoDB is on same server

## Maintenance

### Update Application

```bash
cd /var/www/inventory-management
chmod +x deploy.sh
./deploy.sh
```

### PM2 Commands

```bash
pm2 restart inventory-management  # Restart app
pm2 stop inventory-management     # Stop app
pm2 logs inventory-management     # View logs
pm2 monit                         # Monitor resources
```

### Backup Database

```bash
# MongoDB dump
mongodump --db inventory-management --out /backup/$(date +%Y%m%d)
```

## Troubleshooting

### Application won't start

```bash
# Check logs
pm2 logs inventory-management --lines 100

# Check environment variables
cat .env.local

# Verify build
npm run build
```

### Database connection issues

```bash
# Test MongoDB connection
mongo inventory-management

# Check MongoDB status
sudo systemctl status mongod
```

### Port already in use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>
```

## Development vs Production

### Files Removed for Production

The following development-only endpoints should be removed before deployment:
- `app/api/auth/update-schema/` - Schema update utility
- `app/api/auth/fix-roles/` - Role fix utility
- `app/api/auth/debug-roles/` - Debug endpoint

### Features Disabled in Production

- Test account button (automatically hidden when NODE_ENV=production)
- Verbose console logging
- Development error messages

## First Time Setup

After deployment, create your first admin user:

1. Navigate to: `http://your-domain.com/signup`
2. Fill in admin details
3. This will be your only admin account
4. Additional users can be created from the admin panel

## Support

For issues, check:
- PM2 logs: `pm2 logs`
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- MongoDB logs: `sudo tail -f /var/log/mongodb/mongod.log`
