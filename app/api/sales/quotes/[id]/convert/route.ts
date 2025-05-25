import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Quote from '@/models/quote';
import Order from '@/models/order';
import { isValidObjectId } from 'mongoose';

// Define types for the quote data structure
interface QuoteData {
  customerId?: string;
  customer?: string;
  clientId?: string;
  client?: string;
  items?: unknown[];
  quoteNumber?: string;
  status?: string;
  _id: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid quote ID' },
        { status: 400 }
      );
    }
    
    const quote = await Quote.findById(id)
      .populate('customer', 'name email')
      .populate('customerId', 'name email');
    
    if (!quote) {
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      );
    }
    
    if (quote.status !== 'accepted') {
      return NextResponse.json(
        { success: false, error: 'Only accepted quotes can be converted to orders' },
        { status: 400 }
      );
    }
    
    // Create order from quote - handle different possible field names
    const quoteData = quote.toObject() as QuoteData;
    const customerId = quoteData.customerId || 
                      quoteData.customer || 
                      quoteData.clientId || 
                      quoteData.client;
    
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer information not found in quote' },
        { status: 400 }
      );
    }
    
    const order = await Order.create({
      customerId: customerId,
      items: quoteData.items,
      status: 'Pending',
      paymentStatus: 'Unpaid',
      notes: `Converted from quote ${quoteData.quoteNumber || quote._id}`,
      quoteId: quote._id
    });
    
    // Update quote with order reference (keeping existing status)
    await Quote.findByIdAndUpdate(id, {
      convertedToOrder: order._id
    });
    
    return NextResponse.json({
      success: true,
      order: await order.populate('customerId', 'name email').populate('customer', 'name email')
    });
  } catch (error) {
    console.error('Error converting quote to order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to convert quote to order' },
      { status: 500 }
    );
  }
}