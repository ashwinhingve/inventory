import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Invoice from '@/models/invoice';
import { isValidObjectId } from 'mongoose';
import { Document } from 'mongoose';

interface InvoiceDocument extends Document {
  _id: string;
  invoiceNumber: string;
  customer: {
    name: string;
    email: string;
    address?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiResponse<T> {
  success: boolean;
  invoice?: T;
  error?: string;
  message?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<InvoiceDocument>>> {
  try {
    await connectToDB();
    
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid invoice ID' },
        { status: 400 }
      );
    }
    
    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<InvoiceDocument>>> {
  try {
    await connectToDB();
    
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid invoice ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    const invoice = await Invoice.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      invoice
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<void>>> {
  try {
    await connectToDB();
    
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid invoice ID' },
        { status: 400 }
      );
    }
    
    const invoice = await Invoice.findByIdAndDelete(id);
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}