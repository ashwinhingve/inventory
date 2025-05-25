import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Payment from '@/models/payment';
import Order from '@/models/order';
import { isValidObjectId } from 'mongoose';

interface PaymentQuery {
  orderId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

interface PaymentCreate {
  orderId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const query: PaymentQuery = {};
    
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
    
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('orderId', 'reference customer');
    
    const total = await Payment.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      payments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    
    const body = await request.json() as PaymentCreate;
    
    if (!body.orderId || !isValidObjectId(body.orderId)) {
      return NextResponse.json(
        { success: false, error: 'Valid order ID is required' },
        { status: 400 }
      );
    }
    
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      );
    }
    
    if (!body.paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Payment method is required' },
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
    
    const payment = await Payment.create(body);
    
    // Update order's total paid amount
    await Order.findByIdAndUpdate(body.orderId, {
      $inc: { totalPaid: body.amount }
    });
    
    return NextResponse.json({
      success: true,
      payment: await payment.populate('orderId', 'reference customer')
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}