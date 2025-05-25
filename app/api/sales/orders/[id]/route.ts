import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Order from '@/models/order';
import Product from '@/models/product';
import mongoose from 'mongoose';

// GET a single order
export async function GET(
  request: NextRequest, 
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    await connectToDB();
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }
    
    const order = await Order.findById(id)
      .populate('customer', 'name email phone address')
      .populate('items.product', 'name sku category');
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// UPDATE an order
export async function PUT(
  request: NextRequest, 
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    await connectToDB();
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }
    
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // If items are updated, recalculate the totals
    if (body.items && body.items.length > 0) {
      const populatedItems = [];
      
      for (const item of body.items) {
        if (!item.product || !item.quantity || item.quantity < 1) {
          return NextResponse.json(
            { error: 'Each item must have a valid product and quantity' },
            { status: 400 }
          );
        }
        
        // Fetch product from database to get current name (price comes from request)
        const product = await Product.findById(item.product);
        if (!product) {
          return NextResponse.json(
            { error: `Product not found for item: ${item.product}` },
            { status: 400 }
          );
        }
        
        populatedItems.push({
          product: product._id,
          productName: product.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        });
      }
      
      // Update the order items
      body.items = populatedItems;
    }
    
    // Handle status change (possible business logic here)
    if (body.status && body.status !== order.status) {
      // You could add special handling for certain status transitions
      // For example, if status changes to "Completed", you might want to update inventory
    }
    
    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE an order
export async function DELETE(
  request: NextRequest, 
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    await connectToDB();
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }
    
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Check if order can be deleted (e.g., not yet shipped, etc.)
    if (order.status === 'Completed') {
      return NextResponse.json(
        { error: 'Cannot delete a completed order' },
        { status: 400 }
      );
    }
    
    await Order.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
} 