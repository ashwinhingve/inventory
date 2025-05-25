import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Purchase from '@/models/purchase';
import Product from '@/models/product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isValidObjectId } from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Make authentication optional for development
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid purchase ID' }, { status: 400 });
    }

    await connectToDatabase();
    
    const purchase = await Purchase.findById(id);
    
    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Error fetching purchase:', error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Make authentication optional for development
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid purchase ID' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Find the current purchase to get its status
    const currentPurchase = await Purchase.findById(id);
    if (!currentPurchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Handle status changes if needed
    if (body.status && body.status !== currentPurchase.status) {
      // If changing from pending to received, update product quantities
      if (body.status === 'received' && currentPurchase.status !== 'received') {
        for (const item of currentPurchase.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { quantity: item.quantity } }
          );
        }
      }
      // If changing from received to another status, reduce product quantities
      else if (currentPurchase.status === 'received' && body.status !== 'received') {
        for (const item of currentPurchase.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { quantity: -item.quantity } }
          );
        }
      }
    }
    
    // Update the purchase
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedPurchase);
  } catch (error) {
    console.error('Error updating purchase:', error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Make authentication optional for development
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid purchase ID' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Find the purchase first to get its data
    const purchase = await Purchase.findById(id);
    
    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }
    
    // If purchase was received, revert the inventory changes before deleting
    if (purchase.status === 'received') {
      for (const item of purchase.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { quantity: -item.quantity } }
        );
      }
    }
    
    // Delete the purchase
    await Purchase.findByIdAndDelete(id);
    
    return NextResponse.json({ 
      message: 'Purchase deleted successfully',
      purchase
    });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}