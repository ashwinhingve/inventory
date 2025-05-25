import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Product from '@/models/product';
 

interface ProductQuery {
  name?: { $regex: string; $options: string };
  category?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
}
 
export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query
    const query: ProductQuery = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (minPrice) {
      query.minPrice = parseFloat(minPrice);
    }
    
    if (maxPrice) {
      query.maxPrice = parseFloat(maxPrice);
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await Product.countDocuments(query);
    
    // Get products with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get unique categories for filter
    const categories = await Product.distinct('category');
    
    return NextResponse.json({
      success: true,
      products,
      categories,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'category', 'price'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Create new product
    const product = await Product.create(body);
    
    return NextResponse.json({
      success: true,
      product
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
} 