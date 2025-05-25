import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Invoice from '@/models/invoice';

interface InvoiceQuery {
  date?: { $gte?: Date; $lte?: Date };
  status?: string;
  customer?: string;
  $or?: Array<{
    reference?: { $regex: string; $options: string };
    customer?: { $regex: string; $options: string };
  }>;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query
    const query: InvoiceQuery = {};
    
    if (search) {
      query.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { customer: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await Invoice.countDocuments(query);
    
    // Get invoices with pagination
    const invoices = await Invoice.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    return NextResponse.json({
      success: true,
      invoices,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['date', 'customer', 'items', 'total'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Create new invoice
    const invoice = await Invoice.create(body);
    
    return NextResponse.json({
      success: true,
      invoice
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
} 