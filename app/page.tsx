// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';

// export default function HomePage() {
//   const router = useRouter();
//   const { status } = useSession();

//   useEffect(() => {
//     // Only redirect when session status is determined (not loading)
//     if (status === 'loading') return;

//     if (status === 'authenticated') {
//       router.push('/dashboard');
//     } else if (status === 'unauthenticated') {
//       router.push('/login');
//     }
//   }, [status, router]);

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//     </div>
//   );
// }


// app/page.tsx
'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Users,
  FileText,
  ShoppingCart,
  Package,
  Calculator,
  BarChart3,
  Shield,
  Cloud,
  Smartphone,
  CheckCircle,
  Search,
  Menu,
  Star,
  ArrowRight
} from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const Homepage = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const dashboardRef = useRef(null);
  const benefitsRef = useRef(null);

  useEffect(() => {
    // GSAP scroll animations
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from('.hero-content', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power2.out'
      });

      gsap.from('.hero-image', {
        duration: 1.2,
        x: 100,
        opacity: 0,
        delay: 0.3,
        ease: 'power2.out'
      });

      // Features scroll animation
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%'
        },
        duration: 0.8,
        y: 30,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out'
      });

      // Dashboard preview animation
      gsap.from('.dashboard-preview', {
        scrollTrigger: {
          trigger: dashboardRef.current,
          start: 'top 70%'
        },
        duration: 1,
        scale: 0.9,
        opacity: 0,
        ease: 'power2.out'
      });

      // Benefits animation
      gsap.from('.benefit-item', {
        scrollTrigger: {
          trigger: benefitsRef.current,
          start: 'top 80%'
        },
        duration: 0.6,
        x: -30,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out'
      });
    });

    return () => ctx.revert();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Party Management",
      description: "Manage customers, suppliers, and vendors with complete transaction history"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "All Entries & Bills",
      description: "Create invoices, receipts, and manage all business documents"
    },
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "Sales & Purchase",
      description: "Track orders and manage purchase workflows with GST compliance"
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: "Inventory",
      description: "Real-time stock tracking with automated reorder alerts"
    },
    {
      icon: <Calculator className="w-8 h-8" />,
      title: "Accounting",
      description: "Generate GST reports and financial statements automatically"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Reports & Analytics",
      description: "Business insights with profit analysis and trend reports"
    }
  ];

  const benefits = [
    { icon: <CheckCircle className="w-5 h-5" />, text: "GST-ready & Compliant" },
    { icon: <BarChart3 className="w-5 h-5" />, text: "Real-time Reports" },
    { icon: <Package className="w-5 h-5" />, text: "Barcode Support" },
    { icon: <Users className="w-5 h-5" />, text: "Multi-user Access" },
    { icon: <Cloud className="w-5 h-5" />, text: "Secure Cloud Backup" },
    { icon: <Smartphone className="w-5 h-5" />, text: "Simple UI Design" },
    { icon: <Shield className="w-5 h-5" />, text: "Data Security" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "Free Plan Available" }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Owner, Kumar Electronics",
      avatar: "RK",
      quote: "InventoryPro has transformed our retail business. The GST compliance and real-time tracking save us hours daily."
    },
    {
      name: "Priya Sharma",
      role: "Manager, Sharma Textiles",
      avatar: "PS",
      quote: "The dashboard gives complete business visibility. Sales, inventory, and finances all in one place."
    },
    {
      name: "Amit Mehta",
      role: "Director, Mehta Industries",
      avatar: "AM",
      quote: "Multi-user access and role management are perfect for our growing team. Intuitive and powerful."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">InventoryPro</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</a>
              <a href="#products" className="text-gray-600 hover:text-blue-600 transition-colors">Products</a>
              <a href="#sales" className="text-gray-600 hover:text-blue-600 transition-colors">Sales</a>
              <a href="#purchases" className="text-gray-600 hover:text-blue-600 transition-colors">Purchases</a>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <a href="/login" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                  Sign In
                </a>
                <a href="/signup" className="text-blue-600 hover:text-blue-700 transition-colors font-medium border border-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50">
                  Sign Up
                </a>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started Free
              </motion.button>
              <button className="md:hidden p-2">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="hero-content">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
              >
                Manage Your Store with
                <span className="text-blue-600"> Powerful</span> Inventory Tools
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-gray-600 mb-8 leading-relaxed"
              >
                Track sales, purchases, profit, stock & more—all in one clean dashboard designed for Indian businesses
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300"
                >
                  Try Free
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  Book Demo
                </motion.button>
              </motion.div>
            </div>

            {/* Dashboard Preview */}
            <div className="hero-image">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  {/* Mock Dashboard Header */}
                  <div className="bg-gray-900 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-white text-sm">InventoryPro Dashboard</div>
                  </div>

                  {/* Mock Dashboard Content */}
                  <div className="p-6 bg-gray-50">
                    <div className="flex">
                      {/* Sidebar */}
                      <div className="w-1/4 bg-gray-900 rounded-lg p-4 mr-4">
                        <div className="space-y-3">
                          {['Dashboard', 'Products', 'Sales', 'Purchases', 'Reports'].map((item, index) => (
                            <div key={index} className="text-gray-300 text-xs py-2 px-3 rounded hover:bg-gray-800">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-blue-600 text-white p-4 rounded-lg">
                            <div className="text-xs opacity-80">Total Sales</div>
                            <div className="text-lg font-bold">₹2,45,000</div>
                          </div>
                          <div className="bg-green-600 text-white p-4 rounded-lg">
                            <div className="text-xs opacity-80">Profit</div>
                            <div className="text-lg font-bold">₹45,000</div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="text-sm font-semibold mb-2">Sales Trend</div>
                          <div className="h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Business
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed specifically for Indian retail, wholesale, and manufacturing businesses
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{
                  y: -10,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
                className="feature-card bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-200 transition-all duration-300"
              >
                <div className="text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section ref={dashboardRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6"
              >
                Simple Dashboard, Powerful Insights
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg text-gray-600 mb-8 leading-relaxed"
              >
                Get complete business visibility with real-time analytics. Track sales trends, monitor inventory levels, and make data-driven decisions with our intuitive dashboard designed for Indian businesses.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                >
                  <span>View Live Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </div>

            <div className="dashboard-preview">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
              >
                {/* Enhanced Dashboard Mockup */}
                <div className="bg-gray-900 p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-white text-sm font-medium">Business Overview</div>
                </div>

                <div className="p-6 bg-gray-50">
                  <div className="flex">
                    {/* Enhanced Sidebar */}
                    <div className="w-48 bg-gray-900 rounded-lg p-4 mr-6">
                      <div className="space-y-2">
                        {[
                          { name: 'Dashboard', icon: '📊', active: true },
                          { name: 'Products', icon: '📦' },
                          { name: 'Sales', icon: '💰' },
                          { name: 'Purchases', icon: '🛒' },
                          { name: 'Inventory', icon: '📋' },
                          { name: 'Reports', icon: '📈' }
                        ].map((item, index) => (
                          <div
                            key={index}
                            className={`text-xs py-2 px-3 rounded flex items-center space-x-2 ${item.active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                              }`}
                          >
                            <span>{item.icon}</span>
                            <span>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Main Content */}
                    <div className="flex-1">
                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-600 text-white p-4 rounded-lg">
                          <div className="text-xs opacity-80 mb-1">Total Revenue</div>
                          <div className="text-xl font-bold">₹2,45,000</div>
                          <div className="text-xs opacity-80">+12% from last month</div>
                        </div>
                        <div className="bg-green-600 text-white p-4 rounded-lg">
                          <div className="text-xs opacity-80 mb-1">Net Profit</div>
                          <div className="text-xl font-bold">₹45,000</div>
                          <div className="text-xs opacity-80">+8% from last month</div>
                        </div>
                        <div className="bg-purple-600 text-white p-4 rounded-lg">
                          <div className="text-xs opacity-80 mb-1">Stock Value</div>
                          <div className="text-xl font-bold">₹1,85,000</div>
                          <div className="text-xs opacity-80">234 items in stock</div>
                        </div>
                        <div className="bg-orange-600 text-white p-4 rounded-lg">
                          <div className="text-xs opacity-80 mb-1">Pending Orders</div>
                          <div className="text-xl font-bold">23</div>
                          <div className="text-xs opacity-80">Worth ₹45,000</div>
                        </div>
                      </div>

                      {/* Chart Area */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-sm font-semibold">Sales Trend (Last 30 Days)</div>
                          <div className="text-xs text-gray-500">Updated 2 mins ago</div>
                        </div>
                        <div className="h-20 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 rounded relative">
                          {/* Mock chart line */}
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 80">
                            <polyline
                              points="10,60 50,40 90,45 130,25 170,30 210,15 250,20 290,10"
                              fill="none"
                              stroke="#2563eb"
                              strokeWidth="2"
                              className="drop-shadow-sm"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tooltip Annotations */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute top-32 right-4 bg-black text-white text-xs px-2 py-1 rounded shadow-lg"
                >
                  Real-time Analytics
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  className="absolute bottom-20 left-8 bg-black text-white text-xs px-2 py-1 rounded shadow-lg"
                >
                  Easy Navigation
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
  <div className="max-w-7xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="text-center mb-16"
    >
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
        Built for Indian Businesses
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Everything you need to run your business efficiently, with features designed specifically for the Indian market
      </p>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {benefits.map((benefit, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="benefit-item flex items-center space-x-3 p-6 bg-gray-50 rounded-lg hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <div className="text-green-600 flex-shrink-0">
            {benefit.icon}
          </div>
          <span className="text-gray-800 font-medium">
            {benefit.text}
          </span>
        </motion.div>
      ))}
    </div>
  </div>
</section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by thousands of Indian businesses
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your business needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Free',
                price: '₹0',
                period: '/month',
                features: ['Up to 100 products', 'Basic reports', '1 user account', 'Email support'],
                cta: 'Get Started',
                popular: false
              },
              {
                name: 'Standard',
                price: '₹99',
                period: '/month',
                features: ['Up to 1000 products', 'Advanced reports', '3 user accounts', 'GST compliance', 'Phone support'],
                cta: 'Start Free Trial',
                popular: true
              },
              {
                name: 'Premium',
                price: '₹199',
                period: '/month',
                features: ['Unlimited products', 'Custom reports', 'Unlimited users', 'Multi-location support', 'Priority support', 'API access'],
                cta: 'Contact Sales',
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.02 }}
                className={`relative p-8 rounded-2xl border-2 ${plan.popular
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-200'
                  } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-1">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 ${plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                      : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                    }`}
                >
                  {plan.cta}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of Indian businesses already using InventoryPro to streamline their operations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Schedule Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">InventoryPro</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Powerful inventory management software designed specifically for Indian businesses. Manage your store with confidence.
              </p>
              <div className="flex space-x-4">
                {['Facebook', 'Twitter', 'LinkedIn', 'Instagram'].map((social, index) => (
                  <motion.a
                    key={index}
                    href="#"
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <span className="text-sm">{social[0]}</span>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Product</h3>
              <ul className="space-y-4">
                {['Features', 'Pricing', 'Dashboard', 'Reports', 'Integrations', 'API'].map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-4">
                {['Help Center', 'Documentation', 'Contact Us', 'Live Chat', 'Phone Support', 'Training'].map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Company</h3>
              <ul className="space-y-4">
                {['About Us', 'Careers', 'Blog', 'Press', 'Partners', 'Terms of Service', 'Privacy Policy'].map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="border-t border-gray-800 pt-8 mb-8">
            <div className="max-w-md mx-auto text-center">
              <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
              <p className="text-gray-400 mb-6">
                Get the latest updates, tips, and features delivered to your inbox
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-white placeholder-gray-400"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 px-6 py-3 rounded-r-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 mb-4 md:mb-0">
              © 2025 InventoryPro. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Made with ❤️ in India</span>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">
                GST Compliant
              </a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">
                ISO Certified
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;