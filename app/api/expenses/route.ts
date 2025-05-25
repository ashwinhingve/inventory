import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Define Expense Schema
const ExpenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    trim: true
  },
  reference: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create or get the model
const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

interface ExpenseQuery {
  date?: { $gte?: Date; $lte?: Date };
  category?: string | { $regex: string; $options: string };
  amount?: { $gte?: number; $lte?: number };
  description?: { $regex: string; $options: string };
  reference?: { $regex: string; $options: string };
  $or?: Array<{
    description?: { $regex: string; $options: string };
    reference?: { $regex: string; $options: string };
    category?: { $regex: string; $options: string };
  }>;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const sort = searchParams.get('sort') || 'date';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query
    const query: ExpenseQuery = {};
    
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (startDate || endDate) {
      query.date = {};
      
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }
    
    // Calculate pagination values
    const skip = (page - 1) * limit;
    
    // Create sort object for MongoDB
    const sortOptions: { [key: string]: 1 | -1 } = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    // Get total count
    const total = await Expense.countDocuments(query);
    
    // Get expenses with pagination and sorting
    const expenses = await Expense.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Get unique categories
    const categories = await Expense.distinct('category');
    
    return NextResponse.json({
      success: true,
      expenses,
      categories,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch expenses: ${err.message || 'Database connection error'}`
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['date', 'category', 'description', 'amount', 'paymentMethod'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === '') {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Ensure amount is a number
    body.amount = Number(body.amount);
    
    if (isNaN(body.amount) || body.amount < 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }
    
    const expense = await Expense.create(body);
    
    return NextResponse.json({
      success: true,
      expense
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: `Failed to create expense: ${err.message || 'Unknown error'}`
      },
      { status: 500 }
    );
  }
}