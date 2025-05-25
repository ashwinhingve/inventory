import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Get Transaction model from the shared schema
const Transaction = mongoose.models.Transaction || 
  mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction ID format' },
        { status: 400 }
      );
    }
    
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch transaction: ${error instanceof Error ? error.message : 'Database error'}`
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction ID format' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['date', 'description', 'type', 'category', 'amount', 'account'];
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
    
    // Check if transaction exists
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    // Update transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      message: 'Transaction updated successfully'
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to update transaction: ${error instanceof Error ? error.message : 'Database error'}`
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction ID format' },
        { status: 400 }
      );
    }
    
    // Check if transaction exists
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    // Delete transaction
    await Transaction.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to delete transaction: ${error instanceof Error ? error.message : 'Database error'}`
      },
      { status: 500 }
    );
  }
}