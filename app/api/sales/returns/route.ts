import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Return from '@/models/return';
import Order from '@/models/order';
import { isValidObjectId } from 'mongoose';

interface ReturnQuery {
  orderId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

interface ReturnCreate {
  orderId: string;
  items: Array<{
    productId: string;
    quantity: number;
    reason: string;
  }>;
  status: string;
  notes?: string;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const query: ReturnQuery = {};
    
    const orderId = searchParams.get('orderId');
    if (orderId && isValidObjectId(orderId)) {
      query.orderId = orderId;
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
    
    const returns = await Return.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('orderId', 'reference customer');
    
    const total = await Return.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      returns,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching returns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch returns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    
    const body = await request.json() as ReturnCreate;
    
    if (!body.orderId || !isValidObjectId(body.orderId)) {
      return NextResponse.json(
        { success: false, error: 'Valid order ID is required' },
        { status: 400 }
      );
    }
    
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one item is required' },
        { status: 400 }
      );
    }
    
    if (!body.status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }
    
    // Check if order exists
    const order = await Order.findById(body.orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    const returnRecord = await Return.create(body);
    
    // Update order's returned items count
    await Order.findByIdAndUpdate(body.orderId, {
      $inc: { returnedItems: body.items.length }
    });
    
    return NextResponse.json({
      success: true,
      return: await returnRecord.populate('orderId', 'reference customer')
    });
  } catch (error) {
    console.error('Error creating return:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create return' },
      { status: 500 }
    );
  }
} 