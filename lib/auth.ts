import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("No credentials provided");
          return null;
        }

        try {
          // Use the login API route instead of direct database access
          console.log(`Attempting to authenticate user: ${credentials.email}`);
          
          const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store'
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
            cache: 'no-store'
          });
          
          if (!response.ok) {
            console.log(`Authentication failed: ${response.status} ${response.statusText}`);
            return null;
          }
          
          const data = await response.json();
          
          if (!data.success) {
            console.log("Login failed:", data.message);
            return null;
          }
          
          console.log("Authentication successful");
          
          // Return user object from the API response
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role || 'user',
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // Reduce session lifetime to 12 hours for security
    updateAge: 4 * 60 * 60, // Force update the session every 4 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
        // Add a token creation timestamp to facilitate forced expiration
        token.createdAt = Date.now();
        
        // Ensure we have a unique token identifier to prevent session confusion
        if (!token.jti) {
          token.jti = crypto.randomUUID();
        }
      }
      // Check if token should be forcibly expired
      if (token.forceLogout) {
        return { ...token, exp: 0 }; // Expire the token immediately
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        // Add sessionExpiry to help client side make informed decisions
        session.expires = new Date(
          typeof token.exp === 'number' 
            ? token.exp * 1000 // Convert seconds to milliseconds
            : Date.now() + 12 * 60 * 60 * 1000 // Fallback
        ).toISOString();
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/login" // Ensure we always redirect to login after signOut
  },
  // Add cookie settings for increased security
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  events: {
    signOut: async () => {
      console.log("User signed out");
      // The session is automatically invalidated on sign out
    },
  },
  debug: process.env.NODE_ENV === 'development', // Only enable debug in development
  logger: {
    error(code, metadata) {
      console.error(`Auth Error: ${code}`, metadata);
    },
    warn(code) {
      console.warn(`Auth Warning: ${code}`);
    },
    debug(code, metadata) {
      console.log(`Auth Debug: ${code}`, metadata);
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "default-secret-key-change-in-production",
};

// Helper function to check if the user is authenticated in API routes
export async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session;
}

// Import and re-export getServerSession to maintain consistency
import { getServerSession } from "next-auth";
import crypto from "crypto";
export { getServerSession }; 