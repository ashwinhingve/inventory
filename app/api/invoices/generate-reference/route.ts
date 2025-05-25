import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Invoice from '@/models/invoice';

export async function GET() {
  try {
    await connectToDB();
    
    // Get the latest invoice
    const latestInvoice = await Invoice.findOne()
      .sort({ reference: -1 })
      .select('reference');
    
    let newReference = 'INV-0001';
    
    if (latestInvoice && latestInvoice.reference) {
      // Extract the number from the latest reference
      const match = latestInvoice.reference.match(/INV-(\d+)/);
      if (match) {
        const lastNumber = parseInt(match[1], 10);
        newReference = `INV-${String(lastNumber + 1).padStart(4, '0')}`;
      }
    }
    
    return NextResponse.json({ reference: newReference });
  } catch (error) {
    console.error('Error generating invoice reference:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice reference' },
      { status: 500 }
    );
  }
} 