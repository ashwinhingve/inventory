import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Item from '@/models/item';
import mongoose from 'mongoose';

// Type for MongoDB errors
interface MongoError extends Error {
  code?: number;
}

// GET a single item by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    
    const item = await Item.findOne({ _id: id, userId: session.user.id });
    
    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error in GET /api/items/[id]:', error);
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// UPDATE an item by ID
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    
    const data = await req.json();
    const item = await Item.findOne({ _id: id, userId: session.user.id });
    
    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    // Update item
    Object.assign(item, data);
    await item.save();

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error in PUT /api/items/[id]:', error);
    const err = error as MongoError;
    return NextResponse.json(
      { 
        success: false, 
        error: err.code === 11000 ? 'Duplicate barcode found' : err.message || 'Internal server error'
      },
      { status: err.code === 11000 ? 400 : 500 }
    );
  }
}

// DELETE an item by ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    
    const item = await Item.findOneAndDelete({ _id: id, userId: session.user.id });
    
    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/items/[id]:', error);
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH endpoint for toggling item status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id = 'unknown';
  try {
    const resolvedParams = await params;
    id = resolvedParams.id;
    await dbConnect();
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid item ID format' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Check if the status field is being updated
    if (body.isActive === undefined) {
      return NextResponse.json(
        { success: false, error: 'Status field is required for PATCH request' },
        { status: 400 }
      );
    }
    
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { isActive: body.isActive },
      { new: true }
    );
    
    if (!updatedItem) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      item: updatedItem,
      message: `Item ${body.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error(`Error in PATCH /api/items/${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update item status' },
      { status: 500 }
    );
  }
}