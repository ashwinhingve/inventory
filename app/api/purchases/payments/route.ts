import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import PurchasePayment from '@/models/purchasePayment';
import Purchase from '@/models/purchase';

interface PaymentQuery {
  purchaseId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

interface PaymentCreate {
  purchaseId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const purchaseId = searchParams.get('purchaseId') || '';
    const status = searchParams.get('status') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query
    const query: PaymentQuery = {};
    
    if (purchaseId) {
      query.purchaseId = purchaseId;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (startDate) {
      query.startDate = new Date(startDate);
    }
    
    if (endDate) {
      query.endDate = new Date(endDate);
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await PurchasePayment.countDocuments(query);
    
    // Get payments with pagination
    const payments = await PurchasePayment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('purchaseId', 'reference supplier');
    
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
    console.error('Error fetching purchase payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    
    const body = await request.json() as PaymentCreate;
    
    // Validate required fields with proper typing
    if (!body.purchaseId) {
      return NextResponse.json(
        { success: false, error: 'purchaseId is required' },
        { status: 400 }
      );
    }
    
    if (!body.amount) {
      return NextResponse.json(
        { success: false, error: 'amount is required' },
        { status: 400 }
      );
    }
    
    if (!body.paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'paymentMethod is required' },
        { status: 400 }
      );
    }
    
    // Check if purchase exists
    const purchase = await Purchase.findById(body.purchaseId);
    if (!purchase) {
      return NextResponse.json(
        { success: false, error: 'Purchase not found' },
        { status: 404 }
      );
    }
    
    // Create new payment
    const payment = await PurchasePayment.create(body);
    
    // Update purchase total paid
    await Purchase.findByIdAndUpdate(body.purchaseId, {
      $inc: { totalPaid: body.amount }
    });
    
    return NextResponse.json({
      success: true,
      payment
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create purchase payment' },
      { status: 500 }
    );
  }
}