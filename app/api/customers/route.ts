import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Customer from '@/models/customer';

interface QueryFilters {
  $or?: Array<Record<string, { $regex: string; $options: string }>>;
  active?: boolean;
  category?: string;
}

interface SortOptions {
  [key: string]: 1 | -1;
}

interface ValidationError {
  errors: {
    [key: string]: {
      message: string;
    }
  };
  name: string;
}

// GET handler - get all customers with filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortField = searchParams.get('sortField') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const active = searchParams.get('active');
    const category = searchParams.get('category') || '';
    
    // Build query based on filters
    const query: QueryFilters = {};
    
    // Search in name, email, or phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by active status
    if (active !== null && active !== undefined) {
      query.active = active === 'true';
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Define sort options
    const sortOptions: SortOptions = {};
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination and sorting
    const customers = await Customer.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Customer.countDocuments(query);
    
    // Get available categories for filtering
    const categories = await Customer.distinct('category');
    
    return NextResponse.json({
      customers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      filters: {
        categories: categories.filter(Boolean) // Remove null/empty categories
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST handler - create a new customer
export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    
    const body = await request.json();
    
    // Check if customer with this email already exists
    if (body.email) {
      const existingCustomer = await Customer.findOne({ email: body.email });
      if (existingCustomer) {
        return NextResponse.json(
          { error: 'Customer with this email already exists' },
          { status: 400 }
        );
      }
    }
    
    // Create the customer
    const customer = await Customer.create(body);
    
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    
    if ((error as ValidationError).name === 'ValidationError') {
      const validationErrors = Object.values((error as ValidationError).errors).map(err => err.message);
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
} 