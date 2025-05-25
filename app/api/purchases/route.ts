import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import Purchase from '@/models/purchase';
import type { PurchaseModel } from '@/models/purchase';
import Product from '@/models/product';
import { isValidObjectId } from 'mongoose';

// Fix model declaration
const PurchaseModel = (mongoose.models.Purchase || Purchase) as PurchaseModel;

// Validation schema for query parameters
const QuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.string().default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10)
});

interface QueryOptions {
  $or?: Array<{
    [key: string]: { $regex: string; $options: string } | string;
  }>;
  status?: string;
  date?: {
    $gte?: Date;
    $lte?: Date;
  };
}

interface SortOptions {
  [key: string]: 1 | -1;
}

export async function GET(request: NextRequest) {
  try {
    // Make authentication optional for development
    // try {
    //   const session = await getServerSession(authOptions);
    //   // In production, uncomment this check
    //   // if (!session) {
    //   //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    //   // }
    // } catch (authError) {
    //   console.warn('Auth error (continuing anyway):', authError);
    // }

    await dbConnect();
    
    // Get query parameters
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    // Validate query parameters
    const { 
      search, 
      status, 
      startDate, 
      endDate, 
      sortBy, 
      sortOrder, 
      page, 
      limit 
    } = QuerySchema.parse(params);
    
    // Build query
    const query: QueryOptions = {};
    
    if (search) {
      query.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (status && status !== 'all') {
      query.status = status.toLowerCase();
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.date.$lte = endDateTime;
      }
    }

    // Set up sort options
    const sortOptions: SortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Count total documents for pagination
    const total = await PurchaseModel.countDocuments(query);
    
    // Fetch purchases with pagination
    const purchases = await PurchaseModel.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);
    
    // Return response
    return NextResponse.json({
      purchases,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    const err = error as Error;
    return NextResponse.json(
      { error: error instanceof Error ? err.message : 'Internal Server Error' },
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Make authentication optional for development
    // try {
    //   const session = await getServerSession(authOptions);
    //   // In production, uncomment this check
    //   // if (!session) {
    //   //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    //   // }
    // } catch (authError) {
    //   console.warn('Auth error (continuing anyway):', authError);
    // }

    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.supplierName || !body.items || !body.items.length) {
      return NextResponse.json(
        { error: 'Supplier name and at least one item are required' },
        { status: 400 }
      );
    }

    // Generate reference if not provided
    if (!body.reference) {
      body.reference = await PurchaseModel.generateReference();
    }

    // Validate items
    for (const item of body.items) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: 'Each item must have a valid product ID and quantity' },
          { status: 400 }
        );
      }

      // Lookup product details if not provided
      if (!item.name || !item.price) {
        if (!isValidObjectId(item.product)) {
          return NextResponse.json(
            { error: `Invalid product ID: ${item.product}` },
            { status: 400 }
          );
        }

        const product = await Product.findById(item.product);
        
        if (!product) {
          return NextResponse.json(
            { error: `Product not found for item: ${item.product}` },
            { status: 400 }
          );
        }
        
        item.name = item.name || product.name;
        item.price = item.price || product.buyingPrice;
      }
      
      // Calculate item total if not provided
      if (!item.total) {
        item.total = item.quantity * item.price;
      }
    }

    // Create new purchase
    const newPurchase = await PurchaseModel.create(body);
    
    // If purchase is already marked as received, update product quantities
    if (body.status === 'received') {
      for (const item of body.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { quantity: item.quantity } }
        );
      }
    }
    
    return NextResponse.json(newPurchase, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase:', error);
    const err = error as Error;
    return NextResponse.json(
      { error: error instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
} 