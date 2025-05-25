import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Get Expense model from the shared schema
const Expense = mongoose.models.Expense || 
  mongoose.model('Expense', new mongoose.Schema({}, { strict: false }));

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
        { success: false, error: 'Invalid expense ID format' },
        { status: 400 }
      );
    }
    
    const expense = await Expense.findById(id);
    
    if (!expense) {
      return NextResponse.json(
        { success: false, error: 'Expense not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      expense
    });
  } catch (error) {
    console.error('Error fetching expense:', error);
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch expense: ${err.message || 'Database error'}`
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
        { success: false, error: 'Invalid expense ID format' },
        { status: 400 }
      );
    }
    
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
    
    // Check if expense exists
    const expense = await Expense.findById(id);
    
    if (!expense) {
      return NextResponse.json(
        { success: false, error: 'Expense not found' },
        { status: 404 }
      );
    }
    
    // Update expense
    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      expense: updatedExpense,
      message: 'Expense updated successfully'
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: `Failed to update expense: ${err.message || 'Database error'}`
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
        { success: false, error: 'Invalid expense ID format' },
        { status: 400 }
      );
    }
    
    // Check if expense exists
    const expense = await Expense.findById(id);
    
    if (!expense) {
      return NextResponse.json(
        { success: false, error: 'Expense not found' },
        { status: 404 }
      );
    }
    
    // Delete expense
    await Expense.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: `Failed to delete expense: ${err.message || 'Database error'}`
      },
      { status: 500 }
    );
  }
}