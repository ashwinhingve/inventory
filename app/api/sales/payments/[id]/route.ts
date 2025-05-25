import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Payment from '@/models/payment';
import Order from '@/models/order';
import { isValidObjectId } from 'mongoose';

interface PaymentUpdate {
  amount?: number;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
  status?: string;
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
        { success: false, error: 'Invalid payment ID' },
        { status: 400 }
      );
    }
    
    const payment = await Payment.findById(id)
      .populate('orderId', 'reference customer');
    
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment' },
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
        { success: false, error: 'Invalid payment ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json() as PaymentUpdate;
    
    const payment = await Payment.findByIdAndUpdate(
      id,
      body,
      { new: true }
    ).populate('orderId', 'reference customer');
    
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    // If amount is updated, update order's total paid amount
    if (body.amount) {
      const oldPayment = await Payment.findById(id);
      if (oldPayment) {
        const amountDiff = body.amount - oldPayment.amount;
        await Order.findByIdAndUpdate(payment.orderId, {
          $inc: { totalPaid: amountDiff }
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment' },
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
        { success: false, error: 'Invalid payment ID' },
        { status: 400 }
      );
    }
    
    const payment = await Payment.findById(id);
    
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    // Update order's total paid amount
    await Order.findByIdAndUpdate(payment.orderId, {
      $inc: { totalPaid: -payment.amount }
    });
    
    // Delete payment
    await Payment.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}