import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import PurchaseReturn from '@/models/purchaseReturn';
import Purchase from '@/models/purchase';
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
    
    const purchaseReturn = await PurchaseReturn.findById(id)
      .populate('purchaseId', 'reference supplier');
    
    if (!purchaseReturn) {
      return NextResponse.json(
        { success: false, error: 'Return not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      return: purchaseReturn
    });
  } catch (error) {
    console.error('Error fetching purchase return:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase return' },
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
    
    const purchaseReturn = await PurchaseReturn.findByIdAndUpdate(
      id,
      body,
      { new: true }
    ).populate('purchaseId', 'reference supplier');
    
    if (!purchaseReturn) {
      return NextResponse.json(
        { success: false, error: 'Return not found' },
        { status: 404 }
      );
    }
    
    // If items are updated, update purchase returned items count
    if (body.items) {
      const oldReturn = await PurchaseReturn.findById(id);
      if (oldReturn) {
        const itemsDiff = body.items.length - oldReturn.items.length;
        await Purchase.findByIdAndUpdate(purchaseReturn.purchase, {
          $inc: { returnedItems: itemsDiff }
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      return: purchaseReturn
    });
  } catch (error) {
    console.error('Error updating purchase return:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update purchase return' },
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
    
    const purchaseReturn = await PurchaseReturn.findById(id);
    
    if (!purchaseReturn) {
      return NextResponse.json(
        { success: false, error: 'Return not found' },
        { status: 404 }
      );
    }
    
    // Update purchase returned items count
    await Purchase.findByIdAndUpdate(purchaseReturn.purchase, {
      $inc: { returnedItems: -purchaseReturn.items.length }
    });
    
    // Delete return
    await PurchaseReturn.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Return deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting purchase return:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete purchase return' },
      { status: 500 }
    );
  }
}