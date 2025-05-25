'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
   
  ChevronRightIcon, 
  ShoppingCartIcon, 
  HomeIcon, 
  CubeIcon, 
  TruckIcon, 
  
  UsersIcon, 
  DocumentChartBarIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { useStore } from '@/context/storeContext';
import { NavigationItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

// Define navigation outside the component to prevent recreation on every render
const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Party', href: '/parties' , icon: UsersIcon},
  { name: 'All Entries & Bills', href: '/all-entries' , icon: DocumentChartBarIcon},
  { 
    name: 'Sales', 
    href: '#', 
    icon: ShoppingCartIcon,
    children: [
      { name: 'Sales Invoice', href: '/sales/invoice' },
      { name: 'Sales Return', href: '/sales/return' },
      { name: 'Payment In', href: '/sales/payment-in' },
      { name: 'Sales Orders', href: '/sales/orders' },
      { name: 'Quotations', href: '/sales/quotes' },
    ]
  },
  { 
    name: 'Purchase', 
    href: '#', 
    icon: TruckIcon,
    children: [
      { name: 'Purchase Invoice', href: '/purchase/invoice' },
      { name: 'Purchase Return', href: '/purchase/return' },
      { name: 'Purchase Orders', href: '/purchase/orders' },
      { name: 'Payment Out', href: '/purchase/payment-out' },
    ]
  },
  { 
    name: 'Inventory', 
    href: '#', 
    icon: CubeIcon,
    children: [
      { name: 'Stock', href: '/inventory/stock' },
      { name: 'Items', href: '/inventory/items' },
      { name: 'Barcode', href: '/inventory/barcode' },
      { name: 'Manage Stores', href: '/inventory/stores' },
    ]
  },
  { 
    name: 'Accounting', 
    href: '#', 
    icon: DocumentChartBarIcon,
    children: [
      { name: 'Expense', href: '/accounting/expense' },
      { name: 'Cash & Bank', href: '/accounting/cash-bank' },
    ]
  },
  { name: 'Reports', href: '/reports', icon: DocumentChartBarIcon },
  { name: 'Manage Staff', href: '/staff', icon: UsersIcon },
  { name: 'Help', href: '/help', icon: QuestionMarkCircleIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
  //{ name: 'Manage Plan', href: '/plan', icon: BuildingStorefrontIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentStore   } = useStore();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Track which sections are expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  
  // Auto-expand the section of the current active page
  useEffect(() => {
    if (pathname) {
      const activeParent = navigation.find(item => 
        item.children?.some(child => child.href === pathname || pathname.startsWith(child.href + '/'))
      );
      
      if (activeParent) {
        setExpanded(prev => ({
          ...prev,
          [activeParent.name]: true
        }));
      }
    }
  }, [pathname]);
  
  const toggleExpand = (name: string) => {
    setExpanded(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };
  
  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
  // Close mobile menu when clicking outside on small screens
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const toggle = document.getElementById('sidebar-toggle');
      
      if (isMobileMenuOpen && sidebar && toggle && 
          !sidebar.contains(e.target as Node) && 
          !toggle.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isMobileMenuOpen]);

  // Animation variants
  const sidebarVariants = {
    hidden: { x: -280, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    exit: {
      x: -280,
      opacity: 0,
      transition: { ease: 'easeInOut', duration: 0.3 }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const childrenVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };
  
  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-40 m-4">
        <motion.button
          id="sidebar-toggle"
          className="p-2 bg-gray-800 rounded-md text-gray-100 hover:bg-gray-700 hover:text-white focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <XMarkIcon className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Bars3Icon className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      
      {/* Sidebar backdrop for mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <AnimatePresence>
        <motion.div 
          id="sidebar"
          className={`bg-gray-900 text-white h-full flex-col fixed lg:sticky top-0 left-0 z-30 w-64 lg:flex ${
            isMobileMenuOpen ? 'flex' : 'hidden lg:flex'
          }`}
          variants={sidebarVariants}
          initial={isMobileMenuOpen ? "hidden" : "visible"}
          animate="visible"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <motion.div 
            className="p-4 border-b border-gray-800 flex items-center justify-between"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-white">Inventory Management</h2>
            <motion.button 
              className="lg:hidden text-gray-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <XMarkIcon className="h-6 w-6" />
            </motion.button>
          </motion.div>
          
          <motion.div 
            className="p-4 border-b border-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/dashboard" className="text-blue-400 font-bold hover:text-blue-300 transition-colors duration-200">
              {currentStore}
            </Link>
          </motion.div>
          
          <nav className="flex-1 pt-2 pb-4 overflow-y-auto">
            <ul className="space-y-0.5">
              {navigation.map((item, index) => (
                <motion.li 
                  key={item.name} 
                  className="mb-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  {item.children ? (
                    <div>
                      <motion.button
                        onClick={() => toggleExpand(item.name)}
                        className={`flex items-center w-full px-4 py-3 text-sm hover:bg-gray-800 transition-colors duration-200 ${
                          expanded[item.name] ? 'bg-gray-800' : ''
                        } ${item.children.some(child => isActive(child.href)) ? 'text-blue-400 font-semibold' : 'text-gray-100 font-medium'}`}
                        whileHover={{ backgroundColor: '#1f2937' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                        <span>{item.name}</span>
                        <motion.span 
                          className="ml-auto"
                          animate={{ rotate: expanded[item.name] ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronRightIcon className="w-4 h-4" />
                        </motion.span>
                      </motion.button>
                      
                      <AnimatePresence initial={false}>
                        {expanded[item.name] && (
                          <motion.div
                            variants={childrenVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                          >
                            <ul className="pl-4 mt-1">
                              {item.children.map((child, childIndex) => (
                                <motion.li 
                                  key={child.name}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.05 * childIndex }}
                                >
                                  <Link
                                    href={child.href}
                                    className={`flex items-center px-4 py-2 text-sm ${
                                      isActive(child.href)
                                        ? 'bg-gray-700 text-white font-semibold'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    } rounded-md my-1 transition-all duration-200 ease-in-out`}
                                  >
                                    <motion.div 
                                      whileHover={{ x: 3 }}
                                      transition={{ duration: 0.2 }}
                                      className="w-full"
                                    >
                                      {child.name}
                                    </motion.div>
                                  </Link>
                                </motion.li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="block"
                    >
                      <motion.div
                        className={`flex items-center px-4 py-3 text-sm rounded-md ${
                          isActive(item.href)
                            ? 'bg-gray-700 text-white font-semibold'
                            : 'text-gray-100 hover:bg-gray-800 hover:text-white font-medium'
                        } transition-all duration-200 ease-in-out`}
                        whileHover={{ x: 3, backgroundColor: isActive(item.href) ? '#374151' : '#1f2937' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                        <span>{item.name}</span>
                      </motion.div>
                    </Link>
                  )}
                </motion.li>
              ))}
            </ul>
          </nav>
          
          <motion.div 
            className="p-4 bg-indigo-900 bg-opacity-70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-md p-2 hover:bg-indigo-800 transition-colors duration-200"
            >
              <p className="text-sm font-semibold text-white">Business Plan</p>
              <p className="text-xs text-blue-200 font-medium">Active until Apr 2025</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
} 