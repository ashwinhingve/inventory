import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/mongodb';
import Party from '@/models/party';
import mongoose from 'mongoose';

// Helper to check if a string is a valid ObjectId
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/parties/[id] - Get a party by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid party ID format' },
        { status: 400 }
      );
    }
    
    const party = await Party.findById(id);
    
    if (!party) {
      return NextResponse.json(
        { error: 'Party not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(party);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

// PUT /api/parties/[id] - Update a party
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid party ID format' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Handle shipping address if same as billing
    if (body.sameShippingAddress && body.billingAddress) {
      body.shippingAddress = body.billingAddress;
    }
    
    const party = await Party.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!party) {
      return NextResponse.json(
        { error: 'Party not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(party);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

// DELETE /api/parties/[id] - Delete a party
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid party ID format' },
        { status: 400 }
      );
    }
    
    const party = await Party.findByIdAndDelete(id);
    
    if (!party) {
      return NextResponse.json(
        { error: 'Party not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Party deleted successfully' }
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}