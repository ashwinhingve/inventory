import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Return from '@/models/return';
import Order from '@/models/order';
import { isValidObjectId } from 'mongoose';

interface ReturnUpdate {
  items?: Array<{
    productId: string;
    quantity: number;
    reason: string;
  }>;
  status?: string;
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
        { success: false, error: 'Invalid return ID' },
        { status: 400 }
      );
    }
    
    const returnRecord = await Return.findById(id)
      .populate('orderId', 'reference customer');
    
    if (!returnRecord) {
      return NextResponse.json(
        { success: false, error: 'Return not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      return: returnRecord
    });
  } catch (error) {
    console.error('Error fetching return:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch return' },
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
        { success: false, error: 'Invalid return ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json() as ReturnUpdate;
    
    const returnRecord = await Return.findByIdAndUpdate(
      id,
      body,
      { new: true }
    ).populate('orderId', 'reference customer');
    
    if (!returnRecord) {
      return NextResponse.json(
        { success: false, error: 'Return not found' },
        { status: 404 }
      );
    }
    
    // If items were updated, update order's returned items count
    if (body.items) {
      const order = await Order.findById(returnRecord.orderId);
      if (order) {
        const oldItemsCount = returnRecord.items.length;
        const newItemsCount = body.items.length;
        const difference = newItemsCount - oldItemsCount;
        
        if (difference !== 0) {
          await Order.findByIdAndUpdate(returnRecord.orderId, {
            $inc: { returnedItems: difference }
          });
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      return: returnRecord
    });
  } catch (error) {
    console.error('Error updating return:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update return' },
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
        { success: false, error: 'Invalid return ID' },
        { status: 400 }
      );
    }
    
    const returnRecord = await Return.findById(id);
    
    if (!returnRecord) {
      return NextResponse.json(
        { success: false, error: 'Return not found' },
        { status: 404 }
      );
    }
    
    // Update order's returned items count before deleting
    await Order.findByIdAndUpdate(returnRecord.orderId, {
      $inc: { returnedItems: -returnRecord.items.length }
    });
    
    await Return.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Return deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting return:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete return' },
      { status: 500 }
    );
  }
}