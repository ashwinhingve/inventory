# Production Deployment Cleanup Script
# This script helps prepare the application for production deployment

Write-Host "🧹 Starting production cleanup..." -ForegroundColor Green

# Remove development-only API endpoints
Write-Host "`n📁 Removing development-only endpoints..." -ForegroundColor Yellow

$endpointsToRemove = @(
    "app\api\auth\update-schema",
    "app\api\auth\fix-roles",
    "app\api\auth\debug-roles"
)

foreach ($endpoint in $endpointsToRemove) {
    if (Test-Path $endpoint) {
        Remove-Item -Path $endpoint -Recurse -Force
        Write-Host "  ✓ Removed: $endpoint" -ForegroundColor Green
    } else {
        Write-Host "  ℹ Skipped: $endpoint (not found)" -ForegroundColor Gray
    }
}

# Create logs directory for PM2
Write-Host "`n📂 Creating logs directory..." -ForegroundColor Yellow
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
    Write-Host "  ✓ Created logs directory" -ForegroundColor Green
} else {
    Write-Host "  ℹ Logs directory already exists" -ForegroundColor Gray
}

# Verify required files exist
Write-Host "`n✅ Verifying deployment files..." -ForegroundColor Yellow

$requiredFiles = @(
    ".env.example",
    "ecosystem.config.js",
    "deploy.sh",
    ".gitignore",
    "DEPLOYMENT.md"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (missing)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

# Instructions for .env.local
Write-Host "`n⚙️  Environment Configuration" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Update your .env.local file with production values:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Generate new secrets:" -ForegroundColor White
Write-Host "   node -e `"console.log(require('crypto').randomBytes(32).toString('hex'))`"" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Update these variables in .env.local:" -ForegroundColor White
Write-Host "   - MONGODB_URI (your production database)" -ForegroundColor Gray
Write-Host "   - NEXTAUTH_SECRET (generated secret)" -ForegroundColor Gray
Write-Host "   - JWT_SECRET (generated secret)" -ForegroundColor Gray
Write-Host "   - NEXTAUTH_URL (your VPS domain/IP)" -ForegroundColor Gray
Write-Host "   - NODE_ENV=production" -ForegroundColor Gray
Write-Host ""
Write-Host "3. See .env.example for template" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Test build
Write-Host "`n🔨 Testing production build..." -ForegroundColor Yellow
Write-Host "Run: npm run build" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env.local with production values" -ForegroundColor White
Write-Host "2. Run: npm run build" -ForegroundColor White
Write-Host "3. Test locally: npm start" -ForegroundColor White
Write-Host "4. Deploy to VPS (see DEPLOYMENT.md)" -ForegroundColor White
Write-Host ""
