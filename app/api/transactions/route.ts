import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Transaction from '@/models/transaction';
import { isValidObjectId } from 'mongoose';

interface TransactionQuery {
  type?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  customerId?: string;
  supplierId?: string;
}

interface TransactionCreate {
  type: string;
  amount: number;
  status: string;
  customerId?: string;
  supplierId?: string;
  reference?: string;
  notes?: string;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const query: TransactionQuery = {};
    
    const type = searchParams.get('type');
    if (type) {
      query.type = type;
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
    
    const customerId = searchParams.get('customerId');
    if (customerId && isValidObjectId(customerId)) {
      query.customerId = customerId;
    }
    
    const supplierId = searchParams.get('supplierId');
    if (supplierId && isValidObjectId(supplierId)) {
      query.supplierId = supplierId;
    }
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'name email')
      .populate('supplierId', 'name email');
    
    const total = await Transaction.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    
    const body = await request.json() as TransactionCreate;
    
    if (!body.type || !body.amount || !body.status) {
      return NextResponse.json(
        { success: false, error: 'Type, amount, and status are required' },
        { status: 400 }
      );
    }
    
    if (body.customerId && !isValidObjectId(body.customerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID' },
        { status: 400 }
      );
    }
    
    if (body.supplierId && !isValidObjectId(body.supplierId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid supplier ID' },
        { status: 400 }
      );
    }
    
    const transaction = await Transaction.create(body);
    
    return NextResponse.json({
      success: true,
      transaction: await transaction.populate([
        { path: 'customerId', select: 'name email' },
        { path: 'supplierId', select: 'name email' }
      ])
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
} 