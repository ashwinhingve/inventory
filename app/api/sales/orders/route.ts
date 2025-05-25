import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Order from '@/models/order';
import { isValidObjectId } from 'mongoose';

interface OrderQuery {
  customerId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

interface OrderCreate {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  status: string;
  paymentStatus: string;
  shippingAddress?: string;
  notes?: string;
}

// GET all orders with optional filters
export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const query: OrderQuery = {};
    
    const customerId = searchParams.get('customerId');
    if (customerId && isValidObjectId(customerId)) {
      query.customerId = customerId;
    }
    
    const status = searchParams.get('status');
    if (status) {
      query.status = status;
    }
    
    const startDate = searchParams.get('startDate');
    if (startDate) {
      query.startDate = new Date(startDate);
    }
    
    const endDate = searchParams.get('endDate');
    if (endDate) {
      query.endDate = new Date(endDate);
    }
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'name email');
    
    const total = await Order.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST create a new order
export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    
    const body = await request.json() as OrderCreate;
    
    if (!body.customerId || !isValidObjectId(body.customerId)) {
      return NextResponse.json(
        { success: false, error: 'Valid customer ID is required' },
        { status: 400 }
      );
    }
    
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one item is required' },
        { status: 400 }
      );
    }
    
    if (!body.status || !body.paymentStatus) {
      return NextResponse.json(
        { success: false, error: 'Status and payment status are required' },
        { status: 400 }
      );
    }
    
    const order = await Order.create(body);
    
    return NextResponse.json({
      success: true,
      order: await order.populate('customerId', 'name email')
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 