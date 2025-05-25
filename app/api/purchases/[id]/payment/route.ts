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

// Initialize purchases array with proper typing
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

// Payment status update schema
const paymentUpdateSchema = z.object({
  paymentStatus: z.enum(['pending', 'partial', 'paid']),
  paymentDate: z.string().optional(),
  paymentAmount: z.number().optional(),
  paymentMethod: z.enum(['cash', 'bank', 'credit_card', 'check', 'other']).optional(),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(
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
    
    // Validate the payment update data
    const validationResult = paymentUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid payment data', details: validationResult.error.format() },
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
    
    // Update the payment status
    const paymentData = validationResult.data;
    
    const updatedPurchase: Purchase = {
      ...purchases[index],
      paymentStatus: paymentData.paymentStatus,
      paymentHistory: [
        ...(purchases[index].paymentHistory || []),
        {
          date: paymentData.paymentDate || new Date().toISOString(),
          amount: paymentData.paymentAmount || 0,
          method: paymentData.paymentMethod || 'other',
          reference: paymentData.paymentReference || '',
          notes: paymentData.notes || '',
        }
      ]
    };
    
    purchases[index] = updatedPurchase;
    
    return NextResponse.json({
      message: 'Payment status updated successfully',
      purchase: updatedPurchase
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}