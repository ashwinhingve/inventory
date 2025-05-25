import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define types for better TypeScript support
interface PaymentRecord {
  date: string;
  amount: number;
  method: 'cash' | 'bank' | 'credit_card' | 'check' | 'other';
  reference?: string;
  notes?: string;
}

interface Purchase {
  _id: string;
  totalAmount: number;
  paidAmount?: number;
  paymentStatus?: 'pending' | 'partial' | 'paid';
  paymentHistory?: PaymentRecord[];
  // Add other common purchase properties as needed
  date?: string;
  supplier?: string;
  items?: unknown[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Initialize purchases array
let purchases: Purchase[] = [];

// Import purchases from the parent route
async function loadPurchases() {
  try {
    const importedModule = await import('../../route');
    // Check if the module has a purchases export
    if ('purchases' in importedModule) {
      const moduleWithPurchases = importedModule as { purchases: Purchase[] };
      purchases = moduleWithPurchases.purchases;
    } else {
      console.warn('No purchases data found in parent route');
      purchases = [];
    }
  } catch (err) {
    console.error('Failed to import purchases:', err);
    purchases = [];
  }
}

// Load purchases on module initialization
loadPurchases();

// Schema for adding new payment record
const paymentRecordSchema = z.object({
  date: z.string(),
  amount: z.number().positive(),
  method: z.enum(['cash', 'bank', 'credit_card', 'check', 'other']),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

// GET - Retrieve payment history for a purchase
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Ensure purchases are loaded
    if (purchases.length === 0) {
      await loadPurchases();
    }
    
    // Find the purchase
    const purchase = purchases.find(p => p._id === id);
    
    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }
    
    // Return the payment history
    return NextResponse.json({
      purchaseId: id,
      totalAmount: purchase.totalAmount,
      paidAmount: purchase.paidAmount || 0,
      paymentStatus: purchase.paymentStatus || 'pending',
      paymentHistory: purchase.paymentHistory || []
    });
  } catch (error) {
    console.error('Error retrieving payment history:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST - Add a new payment record to the history
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Ensure purchases are loaded
    if (purchases.length === 0) {
      await loadPurchases();
    }
    
    // Validate the payment record data
    const validationResult = paymentRecordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid payment record data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    // Find the purchase to update
    const index = purchases.findIndex(p => p._id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }
    
    const paymentRecord = validationResult.data as PaymentRecord;
    const purchase = purchases[index];
    
    // Add payment record to history
    const paymentHistory = [...(purchase.paymentHistory || []), paymentRecord];
    
    // Calculate total paid amount
    const paidAmount = paymentHistory.reduce((sum, record) => sum + record.amount, 0);
    
    // Determine payment status
    let paymentStatus: 'pending' | 'partial' | 'paid' = 'pending';
    if (paidAmount >= purchase.totalAmount) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partial';
    }
    
    // Update the purchase
    const updatedPurchase: Purchase = {
      ...purchase,
      paymentHistory,
      paidAmount,
      paymentStatus
    };
    
    purchases[index] = updatedPurchase;
    
    return NextResponse.json({
      message: 'Payment record added successfully',
      purchase: updatedPurchase
    });
  } catch (error) {
    console.error('Error adding payment record:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a payment record from history
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { recordIndex } = body;
    
    // Ensure purchases are loaded
    if (purchases.length === 0) {
      await loadPurchases();
    }
    
    if (typeof recordIndex !== 'number' || recordIndex < 0) {
      return NextResponse.json(
        { error: 'Invalid record index' },
        { status: 400 }
      );
    }
    
    // Find the purchase to update
    const index = purchases.findIndex(p => p._id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }
    
    const purchase = purchases[index];
    
    // Check if payment history exists and has the record
    if (!purchase.paymentHistory || recordIndex >= purchase.paymentHistory.length) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }
    
    // Remove the payment record
    const paymentHistory = purchase.paymentHistory.filter((_, i) => i !== recordIndex);
    
    // Recalculate total paid amount
    const paidAmount = paymentHistory.reduce((sum, record) => sum + record.amount, 0);
    
    // Determine payment status
    let paymentStatus: 'pending' | 'partial' | 'paid' = 'pending';
    if (paidAmount >= purchase.totalAmount) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partial';
    }
    
    // Update the purchase
    const updatedPurchase: Purchase = {
      ...purchase,
      paymentHistory,
      paidAmount,
      paymentStatus
    };
    
    purchases[index] = updatedPurchase;
    
    return NextResponse.json({
      message: 'Payment record removed successfully',
      purchase: updatedPurchase
    });
  } catch (error) {
    console.error('Error removing payment record:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}