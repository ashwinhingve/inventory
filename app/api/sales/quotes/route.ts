import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Quote from '@/models/quote';
import { isValidObjectId } from 'mongoose';

interface QuoteUpdate {
  items?: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  status?: string;
  validUntil?: Date;
  notes?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid quote ID' },
        { status: 400 }
      );
    }
    
    const quote = await Quote.findById(id)
      .populate('customerId', 'name email');
    
    if (!quote) {
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      quote
    });
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid quote ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json() as QuoteUpdate;
    
    const quote = await Quote.findByIdAndUpdate(
      id,
      body,
      { new: true }
    ).populate('customerId', 'name email');
    
    if (!quote) {
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      quote
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quote' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid quote ID' },
        { status: 400 }
      );
    }
    
    const quote = await Quote.findById(id);
    
    if (!quote) {
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      );
    }
    
    // Check if quote is already accepted (converted)
    if (quote.status === 'accepted') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete accepted quote' },
        { status: 400 }
      );
    }
    
    await Quote.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Quote deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete quote' },
      { status: 500 }
    );
  }
}