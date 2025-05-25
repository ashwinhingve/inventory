import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import PurchasePayment from '@/models/purchasePayment';
import Purchase from '@/models/purchase';
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
    
    const payment = await PurchasePayment.findById(id)
      .populate('purchaseId', 'reference supplier');
    
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
    
    const payment = await PurchasePayment.findByIdAndUpdate(
      id,
      body,
      { new: true }
    ).populate('purchaseId', 'reference supplier');
    
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    // If amount is updated, update purchase total paid
    if (body.amount) {
      const oldPayment = await PurchasePayment.findById(id);
      if (oldPayment) {
        const amountDiff = body.amount - oldPayment.amount;
        await Purchase.findByIdAndUpdate(payment.purchaseId, {
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
    
    const payment = await PurchasePayment.findById(id);
    
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    // Update purchase total paid
    await Purchase.findByIdAndUpdate(payment.purchaseId, {
      $inc: { totalPaid: -payment.amount }
    });
    
    // Delete payment
    await PurchasePayment.findByIdAndDelete(id);
    
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