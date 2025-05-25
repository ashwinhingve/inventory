import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { verifyTokenEdge } from '@/lib/tokenUtils';

// Define roles locally to avoid mongoose import in Edge runtime
const ROLES = {
  OWNER: 'owner',
  STORE_ADMIN: 'store_admin',
  SALES_OPERATOR: 'sales_operator',
  SALES_PURCHASE_OPERATOR: 'sales_purchase_operator',
};

// Paths that don't require authentication
const publicPaths = [
  '/login',
  '/api/auth/signin',
  '/api/auth/callback',
  '/signup',
  '/create-account',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify',
  '/api/auth/refresh',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/signup',
  '/api/auth/demo-setup',
  '/api/auth/activate-user',
  '/api/auth/setup',
  '/setup',
  '/api/debug',
  '/favicon.ico',
  '/_next'
];

// File extensions that don't require authentication
const publicExtensions = [
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', 
  '.css', '.js', '.map', '.ttf', '.woff', '.woff2'
];

// Role-based page access permissions
const pageAccessByRole = {
  // Owner has access to everything
  [ROLES.OWNER]: [
    '/dashboard',
    '/parties',
    '/all-entries',
    '/sales/invoice',
    '/sales/return',
    '/sales/payment-in',
    '/sales/orders',
    '/sales/quotes',
    '/purchase/invoice',
    '/purchase/return',
    '/purchase/orders',
    '/purchase/payment-out',
    '/inventory/stock',
    '/inventory/items',
    '/inventory/barcode',
    '/inventory/stores',
    '/accounting/expense',
    '/accounting/cash-bank',
    '/reports',
    '/help',
    '/staff',
    '/settings'
  ],
  
  // Store Admin access
  [ROLES.STORE_ADMIN]: [
    '/parties',
    '/all-entries',
    '/sales/invoice',
    '/sales/return',
    '/sales/payment-in',
    '/sales/orders',
    '/sales/quotes',
    '/purchase/invoice',
    '/purchase/return',
    '/purchase/orders',
    '/purchase/payment-out',
    '/inventory/stock',
    '/inventory/items',
    '/accounting/expense',
    '/help'
  ],
  
  // Sales Operator access
  [ROLES.SALES_OPERATOR]: [
    '/all-entries',
    '/sales/invoice',
    '/sales/return',
    '/sales/orders',
    '/sales/quotes',
    '/inventory/stock',
    '/help'
  ],
  
  // Sales Purchase Operator access
  [ROLES.SALES_PURCHASE_OPERATOR]: [
    '/all-entries',
    '/sales/invoice',
    '/sales/return',
    '/sales/orders',
    '/sales/quotes',
    '/purchase/invoice',
    '/purchase/return',
    '/purchase/orders',
    '/inventory/stock',
    '/help'
  ]
};

// Check if a path is public
function isPublicPath(path: string): boolean {
  // Always bypass NextAuth API routes
  if (path.startsWith('/api/auth/')) {
    return true;
  }
  
  return (
    publicPaths.some(prefix => path.startsWith(prefix)) ||
    publicExtensions.some(ext => path.endsWith(ext))
  );
}

// Check if a user with a given role can access a specific path
function hasAccessToPath(path: string, role: string): boolean {
  // If role is not defined or invalid, deny access
  if (!role || !pageAccessByRole[role]) {
    return false;
  }
  
  // Owner has access to everything - this should be the first check to ensure owner access
  if (role === ROLES.OWNER) {
    console.log(`Owner has full access to: ${path}`);
    return true;
  }

  // For all other roles, check the allowlist
  return pageAccessByRole[role].some(allowedPath => {
    // Check for exact matches or if the current path starts with an allowed path
    // This handles nested routes, e.g. /sales/invoice/new is allowed if /sales/invoice is allowed
    return path === allowedPath || path.startsWith(`${allowedPath}/`);
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths to bypass authentication
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Special handling for root path - redirect to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // IMPORTANT: Break the redirect loop by checking if we're coming from login
  const referer = request.headers.get('referer') || '';
  const isFromLogin = referer.includes('/login');
  
  // If we're coming from login to dashboard, allow access without checking auth
  // This breaks potential redirect loops caused by auth timing issues
  if (isFromLogin && pathname === '/dashboard') {
    console.log('Coming from login to dashboard, allowing access');
    return NextResponse.next();
  }
  
  // Check if we're already redirecting to avoid loops
  const isRedirecting = request.cookies.get('redirecting')?.value === 'true';
  if (isRedirecting && pathname === '/login') {
    // Clear the redirecting cookie and continue
    const response = NextResponse.next();
    response.cookies.delete('redirecting');
    return response;
  }
  
  // Verify the session token from NextAuth
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // Also check for custom token in the Auth header or cookie
  const authHeader = request.headers.get('authorization');
  const customToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  
  // Get cookie token if header token is not available
  const cookiesToken = request.cookies.get('token')?.value;
  
  // For debugging only - In production, remove these log statements
  console.log('Auth Check:', {
    hasSessionToken: !!token,
    hasCustomToken: !!customToken,
    hasCookieToken: !!cookiesToken,
    pathname,
    referer
  });
  
  // If none of the authentication methods are valid, redirect to login
  if (!token && !customToken && !cookiesToken && !isFromLogin) {
    // Create the redirect URL with the return path
    const url = new URL('/login', request.url);
    url.searchParams.set('from', encodeURIComponent(request.nextUrl.pathname));
    
    // Set a cookie to prevent redirect loops
    const response = NextResponse.redirect(url);
    response.cookies.set('redirecting', 'true', { maxAge: 10, path: '/' }); // Short expiry
    
    return response;
  }
  
  let hasValidToken = !!token;
  let tokenRole = token?.role as string;
  
  // Verify custom token if needed and extract role
  if (!hasValidToken && cookiesToken) {
    try {
      const decodedToken = await verifyTokenEdge(cookiesToken);
      hasValidToken = !!decodedToken;
      if (decodedToken && decodedToken.role) {
        tokenRole = decodedToken.role as string;
        console.log('Found role in token:', tokenRole);
      }
    } catch (e) {
      hasValidToken = false;
      console.error('Token verification error:', e);
    }
  }
  
  // If we have a token with role, perform role-based access check
  if (tokenRole && pathname !== '/dashboard') {
    console.log(`Checking access for role ${tokenRole} to path ${pathname}`);
    
    const hasAccess = hasAccessToPath(pathname, tokenRole);
    console.log(`Access granted: ${hasAccess}`);
    
    if (!hasAccess) {
      // Redirect to dashboard with access denied message
      const url = new URL('/dashboard', request.url);
      url.searchParams.set('access', 'denied');
      url.searchParams.set('page', encodeURIComponent(pathname));
      
      return NextResponse.redirect(url);
    }
  }
  
  // If any authentication method is valid and access is allowed, continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image).*)',
  ],
}; 