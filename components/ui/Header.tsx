'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence  } from 'framer-motion';
import { 
  BellIcon, 
  Cog6ToothIcon, 
  UserCircleIcon, 
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { useStore } from '@/context/storeContext';
import { signOut } from 'next-auth/react';

// Typing animation component
const TypeAnimation = ({ phrases }: { phrases: string[] }) => {
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  
  useEffect(() => {
    const phrase = phrases[currentIndex % phrases.length];
    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing forward
        setCurrentPhrase(phrase.substring(0, currentPhrase.length + 1));
        
        // When we complete the phrase
        if (currentPhrase.length === phrase.length) {
          // Pause at the end
          setTypingSpeed(1500);
          setIsDeleting(true);
        } else {
          // Random typing speed for natural feel
          setTypingSpeed(80 + Math.random() * 50);
        }
      } else {
        // Deleting
        setCurrentPhrase(phrase.substring(0, currentPhrase.length - 1));
        
        // When we've deleted all characters
        if (currentPhrase.length === 0) {
          setIsDeleting(false);
          setCurrentIndex(prevIndex => prevIndex + 1);
          setTypingSpeed(500); // Pause before typing next phrase
        } else {
          // Delete faster than typing
          setTypingSpeed(30 + Math.random() * 20);
        }
      }
    }, typingSpeed);
    
    return () => clearTimeout(timer);
  }, [currentPhrase, currentIndex, isDeleting, phrases, typingSpeed]);
  
  return (
    <span className="inline-block">
      {currentPhrase}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="ml-0.5 font-bold text-blue-600"
      >
        |
      </motion.span>
    </span>
  );
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentStore, logout } = useStore();
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Typing animation phrases
  const typingPhrases = [
    "Welcome to Inventory Pro",
    "Manage your stock easily",
    "Track sales in real-time",
    "Smart business solutions"
  ];
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && menuOpen) {
        setMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);
  
  // Animation variants
  const staggerMenuItems = {
    open: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    },
    closed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };
  
  const menuItemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 }
      }
    },
    closed: {
      y: 50,
      opacity: 0,
      transition: {
        y: { stiffness: 1000 }
      }
    }
  };
  
  const menuVariants = {
    hidden: { opacity: 0, y: -5, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    exit: { 
      opacity: 0, 
      y: -5, 
      scale: 0.95,
      transition: { duration: 0.15 }
    }
  };

  const bellAnimation = {
    hover: {
      rotate: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 }
    },
    tap: {
      scale: 0.9
    }
  };

  const searchAnimation = {
    focused: {
      width: '100%',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    blurred: {
      width: '100%',
      boxShadow: 'none',
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  const clearSearch = () => {
    setSearchValue('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const focusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  // Initial animation variants for header elements
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  
  const childVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  
  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15,
        delay: 0.2
      }
    }
  };
  
  const buttonVariants = {
    hover: { 
      scale: 1.05,
      boxShadow: "0 5px 15px rgba(0,0,0,0.1)" 
    },
    tap: { 
      scale: 0.95,
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)" 
    }
  };
  
  // Enhanced logout function to properly clear session data
  const handleLogout = async () => {
    try {
      // Close the menu
      setUserMenuOpen(false);
      
      // Call the context logout first
      if (logout) {
        await logout();
      }
      
      // Use NextAuth signOut with redirect option to force full session cleanup
      await signOut({ 
        redirect: false,
        callbackUrl: '/login'
      });
      
      // Clear any potential localStorage/cookies that might be used for session persistence
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Set a logout flag to prevent auto-login
      localStorage.setItem('manual_logout', 'true');
      
      // Redirect to login page manually
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback redirect if error occurs
      router.push('/login');
    }
  };
  
  return (
    <motion.header 
      className={`sticky top-0 z-50 bg-white backdrop-blur-lg bg-opacity-90 transition-all duration-300 ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}
      initial="hidden"
      animate="visible"
      variants={headerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center space-x-4"
            variants={childVariants}
          >
            <motion.button 
              className="text-gray-500 hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-200 lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              aria-label="Toggle menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </motion.button>
            
            <motion.div 
              variants={logoVariants}
              className="flex items-center"
            >
              <motion.div 
                className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-lg mr-2"
                whileHover={{ 
                  rotate: [0, -5, 5, -5, 0],
                  transition: { duration: 0.5 }
                }}
              >
                I
              </motion.div>
              <motion.div className="hidden sm:block">
                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  <TypeAnimation phrases={typingPhrases} />
                </h1>
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.div
            className="hidden md:flex items-center space-x-8"
            variants={childVariants}
          >
            <NavLink href="/dashboard" label="Dashboard" />
            <NavLink href="/inventory/stock" label="Products" />
            <NavLink href="/sales/invoice" label="Sales" />
            <NavLink href="/purchase/invoice" label="Purchases" />
          </motion.div>
            
          <motion.div 
            className="flex items-center space-x-4"
            variants={childVariants}
          >
            <div className="relative hidden md:block">
              <motion.div 
                className="relative w-44"
                initial="blurred"
                animate={searchFocused ? "focused" : "blurred"}
                variants={searchAnimation}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="block w-full pl-10 pr-8 py-1.5 border border-gray-300 rounded-md text-sm placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  aria-label="Search"
                />
                <motion.div 
                  className="absolute inset-y-0 left-0 pl-3 flex items-center cursor-pointer"
                  onClick={focusSearch}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" />
                </motion.div>
                <AnimatePresence>
                  {searchValue && (
                    <motion.button 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={clearSearch}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      aria-label="Clear search"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
              
            <div className="relative" ref={notificationMenuRef}>
              <motion.button 
                className="relative text-gray-600 hover:text-gray-800 p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                whileHover={{ ...bellAnimation.hover, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Notifications"
              >
                <BellIcon className="h-6 w-6" />
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
                  aria-label="New notifications"
                ></motion.span>
              </motion.button>
                
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div 
                    className="absolute right-0 mt-1 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-30 border"
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="py-1">
                      <h2 className="px-4 py-2 text-sm font-semibold text-gray-800 border-b">Notifications</h2>
                        
                      <div className="max-h-60 overflow-y-auto">
                        <motion.div 
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150 border-l-2 border-blue-700"
                          whileHover={{ x: 4, backgroundColor: '#f9fafb' }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-800 font-semibold">Low stock alert</p>
                            <p className="text-xs text-gray-700 font-medium">1h ago</p>
                          </div>
                          <p className="text-xs text-gray-700 mt-1">5 items are below threshold</p>
                        </motion.div>
                        <motion.div 
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                          whileHover={{ x: 4, backgroundColor: '#f9fafb' }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-800 font-semibold">New order received</p>
                            <p className="text-xs text-gray-700 font-medium">3h ago</p>
                          </div>
                          <p className="text-xs text-gray-700 mt-1">From Customer A</p>
                        </motion.div>
                      </div>
                      <div className="px-4 py-2 border-t text-center">
                        <Link href="/notifications" className="text-sm text-blue-700 hover:text-blue-900 font-semibold transition-colors duration-150">
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
              
            <div className="relative" ref={userMenuRef}>
              <motion.button 
                className="flex items-center text-sm rounded-full focus:outline-none p-1 hover:bg-gray-100 transition-all duration-200"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="User menu"
              >
                <motion.div 
                  className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium"
                  whileHover={{ 
                    boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                    transition: { duration: 0.2 }
                  }}
                >
                  A
                </motion.div>
                <span className="ml-2 hidden md:block font-medium text-gray-800">Admin</span>
                <motion.div
                  animate={{ rotate: userMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDownIcon className="ml-1 h-4 w-4 text-gray-600" />
                </motion.div>
              </motion.button>
                
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-10 border overflow-hidden"
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <motion.div 
                      className="px-4 py-3 border-b text-sm"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                    >
                      <div className="flex items-center">
                        <motion.div 
                          className="flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium text-lg">
                            A
                          </div>
                        </motion.div>
                        <div className="ml-3">
                          <div className="font-semibold text-gray-900">Admin User</div>
                          <div className="text-xs text-gray-600">admin@example.com</div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-600 font-medium">Logged in as</div>
                        <div className="text-sm font-semibold text-gray-800">{currentStore}</div>
                      </div>
                    </motion.div>
                      
                    <Link href="/profile" className="block" role="menuitem">
                      <motion.div 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        whileHover={{ x: 4, backgroundColor: '#f9fafb' }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <UserCircleIcon className="mr-2 h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-800">Your Profile</span>
                      </motion.div>
                    </Link>
                      
                    <Link href="/settings" className="block" role="menuitem">
                      <motion.div 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        whileHover={{ x: 4, backgroundColor: '#f9fafb' }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <Cog6ToothIcon className="mr-2 h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-800">Settings</span>
                      </motion.div>
                    </Link>
                      
                    <div className="border-t my-1"></div>
                      
                    <motion.button 
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      whileHover={{ x: 4, backgroundColor: '#FEF2F2' }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      role="menuitem"
                    >
                      <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5 text-red-600" />
                      <span className="font-medium">Sign out</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons (Mobile) */}
        <motion.div 
          variants={childVariants}
          className="mt-2 mb-3 flex items-center justify-end space-x-2 lg:hidden"
        >
          <motion.button
            className="relative p-1.5 rounded-md border border-gray-300 text-gray-700"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={focusSearch}
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
          </motion.button>
          
          <motion.button
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-semibold text-white bg-green-600 shadow-sm"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="New Sale"
          >
            Sale
          </motion.button>
        </motion.div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            className="lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.div
              variants={staggerMenuItems}
              initial="closed"
              animate="open"
              exit="closed"
              className="px-4 pt-2 pb-3 space-y-1 bg-white shadow-lg"
            >
              <motion.div variants={menuItemVariants}>
                <Link 
                  href="/dashboard" 
                  className={`block px-3 py-2.5 rounded-md text-base font-medium ${
                    pathname === '/dashboard' 
                      ? 'text-blue-700 bg-blue-50' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
              </motion.div>
              <motion.div variants={menuItemVariants}>
                <Link 
                  href="/inventory/stock" 
                  className={`block px-3 py-2.5 rounded-md text-base font-medium ${
                    pathname === '/inventory/stock' || pathname?.startsWith('/inventory/stock/')
                      ? 'text-blue-700 bg-blue-50' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Products
                </Link>
              </motion.div>
              <motion.div variants={menuItemVariants}>
                <Link 
                  href="/sales/invoice" 
                  className={`block px-3 py-2.5 rounded-md text-base font-medium ${
                    pathname === '/sales/invoice' || pathname?.startsWith('/sales/invoice/')
                      ? 'text-blue-700 bg-blue-50' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Sales
                </Link>
              </motion.div>
              <motion.div variants={menuItemVariants}>
                <Link 
                  href="/purchase/invoice" 
                  className={`block px-3 py-2.5 rounded-md text-base font-medium ${
                    pathname === '/purchase/invoice' || pathname?.startsWith('/purchase/invoice/')
                      ? 'text-blue-700 bg-blue-50' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Purchases
                </Link>
              </motion.div>
              <motion.div variants={menuItemVariants} className="mt-4 pt-4 border-t">
                <Link 
                  href="/reports" 
                  className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Reports
                </Link>
              </motion.div>
              <motion.div variants={menuItemVariants}>
                <Link 
                  href="/settings" 
                  className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Settings
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// Navigation Link component with hover and active animations
function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  
  // Fix for the Products tab
  const isProductsActive = 
    href === '/inventory/stock' && 
    (pathname === '/inventory/stock' || pathname?.startsWith('/inventory/stock/'));
  
  // Check if current path matches this link
  const isActive =
    href === pathname ||
    (pathname?.startsWith(href + '/') && href !== '/') ||
    isProductsActive;
  
  return (
    <Link href={href} className="relative py-1">
      <motion.div
        className={`px-3 py-2 text-sm font-medium rounded-md ${
          isActive ? 'text-blue-700' : 'text-gray-700 hover:text-gray-900'
        } transition-colors duration-200 relative`}
        whileHover={!isActive ? { y: -1 } : {}}
      >
        {label}
        {isActive ? (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-700 rounded-full"
            layoutId="activeNavIndicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-400 scale-x-0 rounded-full"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    </Link>
  );
} 