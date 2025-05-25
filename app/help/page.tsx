'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  ChatBubbleBottomCenterTextIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

import { ComponentType } from 'react';
import Layout from '@/components/ui/Layout';

interface FAQ {
  question: string;
  answer: string;
}

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  faqs: FAQ[];
}

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'general',
    title: 'General Questions',
    description: 'Basic information about using the system',
    icon: QuestionMarkCircleIcon,
    faqs: [
      {
        question: 'How do I navigate between different modules?',
        answer: 'You can navigate between different modules using the sidebar located on the left side of the screen. Click on any menu item to access that section of the application.'
      },
      {
        question: 'How can I change my password?',
        answer: 'To change your password, go to Settings > Account Settings. You will find an option to change your password there. You will need to enter your current password for verification.'
      },
      {
        question: 'Is my data backed up?',
        answer: 'Yes, all your data is automatically backed up daily. You can also manually create backups from Settings > Database & Backup.'
      }
    ]
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    description: 'Help with managing products and stock',
    icon: DocumentTextIcon,
    faqs: [
      {
        question: 'How do I add a new product?',
        answer: 'To add a new product, go to Inventory > Stock, then click on the "New Product" button. Fill in the required information and save the product.'
      },
      {
        question: 'How can I track low stock items?',
        answer: 'The system automatically tracks low stock items based on the threshold you set for each product. You can view all low stock items on the Dashboard or in the Inventory > Stock section with the "Low Stock" filter applied.'
      },
      {
        question: 'Can I manage multiple warehouses?',
        answer: 'Yes, you can manage inventory across multiple stores or warehouses. Go to Inventory > Manage Stores to add and configure additional locations.'
      }
    ]
  },
  {
    id: 'sales',
    title: 'Sales & Invoicing',
    description: 'Help with sales transactions and invoices',
    icon: DocumentTextIcon,
    faqs: [
      {
        question: 'How do I create a new sales invoice?',
        answer: 'To create a new sales invoice, go to Sales > Sales Invoice, then click on the "New Invoice" button. Select the customer, add products, set quantities and prices, then save the invoice.'
      },
      {
        question: 'Can I modify an invoice after it has been created?',
        answer: 'Yes, you can edit an invoice as long as it has not been marked as paid. Navigate to the invoice details page and click the "Edit" button to make changes.'
      },
      {
        question: 'How do I process a sales return?',
        answer: 'To process a sales return, go to Sales > Sales Return, then click on "New Return". Select the original invoice, specify the items being returned, and provide a reason for the return.'
      }
    ]
  }
];

const SUPPORT_OPTIONS = [
  {
    id: 'documentation',
    title: 'Documentation',
    description: 'Browse our comprehensive documentation to learn how to use all features of the system',
    icon: DocumentTextIcon,
    link: '/help/documentation'
  },
  {
    id: 'video-tutorials',
    title: 'Video Tutorials',
    description: 'Watch step-by-step video guides on how to use the inventory management system',
    icon: VideoCameraIcon,
    link: '/help/tutorials'
  },
  {
    id: 'chat-support',
    title: 'Live Chat Support',
    description: 'Chat with our support team for immediate assistance during business hours',
    icon: ChatBubbleBottomCenterTextIcon,
    link: '#chat-support'
  },
  {
    id: 'email-support',
    title: 'Email Support',
    description: 'Send us an email and we will get back to you within 24 hours',
    icon: EnvelopeIcon,
    link: 'mailto:support@example.com'
  },
  {
    id: 'phone-support',
    title: 'Phone Support',
    description: 'Call our support team for urgent assistance during business hours',
    icon: PhoneIcon,
    link: 'tel:+18001234567'
  }
];


export default function HelpPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('general');
  const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({});
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };
  
  const toggleFaq = (faqId: string) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [faqId]: !prev[faqId]
    }));
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
          <p className="mt-1 text-sm text-gray-500">
            Find answers to common questions and get help with using the inventory management system
          </p>
        </div>
        
        {/* Search */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
          <div className="max-w-3xl mx-auto">
            <label htmlFor="search" className="sr-only">
              Search help articles
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search for help and answers..."
                type="search"
              />
            </div>
            <div className="mt-3 text-sm text-gray-500 text-center">
              Popular searches: adding products, creating invoices, managing users, data backup
            </div>
          </div>
        </div>
        
        {/* FAQs */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h2>
            <p className="mt-1 text-sm text-gray-500">
              Quick answers to common questions by category
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              {HELP_CATEGORIES.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-md">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full px-4 py-3 flex items-center justify-between focus:outline-none ${
                      expandedCategory === category.id ? 'bg-blue-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <category.icon className={`h-5 w-5 ${expandedCategory === category.id ? 'text-blue-600' : 'text-gray-500'} mr-2`} />
                      <span className="text-sm font-medium text-gray-900">{category.title}</span>
                    </div>
                    {expandedCategory === category.id ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedCategory === category.id && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-4">{category.description}</p>
                      <div className="space-y-2">
                        {category.faqs.map((faq, index) => (
                          <div key={index} className="border border-gray-200 rounded-md bg-white">
                            <button
                              onClick={() => toggleFaq(`${category.id}-${index}`)}
                              className="w-full px-4 py-3 flex items-center justify-between focus:outline-none"
                            >
                              <span className="text-sm font-medium text-gray-900">{faq.question}</span>
                              {expandedFaqs[`${category.id}-${index}`] ? (
                                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                              ) : (
                                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                              )}
                            </button>
                            
                            {expandedFaqs[`${category.id}-${index}`] && (
                              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                                <p className="text-sm text-gray-600">{faq.answer}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Support Options */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Support Options</h2>
            <p className="mt-1 text-sm text-gray-500">
              Get help from our support team or browse resources
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SUPPORT_OPTIONS.map((option) => (
                <Link
                  key={option.id}
                  href={option.link}
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-2">
                    <option.icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">{option.title}</p>
                    <p className="text-sm text-gray-500 truncate">{option.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        {/* Contact Form */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Still Need Help?</h2>
            <p className="mt-1 text-sm text-gray-500">
              Fill out the form below and we&apos;ll get back to you as soon as possible
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 