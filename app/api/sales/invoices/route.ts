import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Invoice from '@/models/invoice';
import Customer from '@/models/customer';

// Helper function to generate next invoice number
async function generateInvoiceNumber() {
  try {
    // Get the latest invoice by sorting by createdAt in descending order
    const latestInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    
    if (!latestInvoice) {
      // If no invoices exist yet, start with INV-10001
      return 'INV-10001';
    }
    
    // Extract the number from the latest invoice number (assuming format INV-#####)
    const latestNumber = parseInt(latestInvoice.invoiceNumber.split('-')[1], 10);
    const nextNumber = latestNumber + 1;
    
    // Format the new invoice number with leading zeros
    return `INV-${nextNumber}`;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    // Fallback to a timestamp-based number in case of errors
    return `INV-${Date.now()}`;
  }
}

// GET handler - get all invoices with filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortField = searchParams.get('sortField') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const fromDate = searchParams.get('fromDate') || '';
    const toDate = searchParams.get('toDate') || '';
    
    // Build query based on filters
    const query: Record<string, string | Record<string, string | Date | { $regex: string; $options: string }> | Array<Record<string, { $regex: string; $options: string }>>> = {};
    
    // Search in invoice number or customer name
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by date range
    if (fromDate && toDate) {
      query.date = { 
        $gte: new Date(fromDate), 
        $lte: new Date(toDate) 
      };
    } else if (fromDate) {
      query.date = { $gte: new Date(fromDate) };
    } else if (toDate) {
      query.date = { $lte: new Date(toDate) };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Define sort options
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination and sorting
    const invoices = await Invoice.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Invoice.countDocuments(query);
    
    return NextResponse.json({
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
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// Define an interface for invoice item
interface InvoiceItem {
  product: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

// POST handler - create a new invoice
export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    
    const body = await request.json();
    
    // Generate invoice number if not provided
    if (!body.invoiceNumber) {
      body.invoiceNumber = await generateInvoiceNumber();
    }
    
    // Calculate totals if not provided
    if (!body.subtotal && body.items && body.items.length > 0) {
      const subtotal = body.items.reduce((sum: number, item: InvoiceItem) => sum + item.total, 0);
      body.subtotal = subtotal;
      
      // If taxTotal and discountTotal are provided, use them; otherwise, calculate
      const taxTotal = body.taxTotal || 0;
      const discountTotal = body.discountTotal || 0;
      
      body.total = subtotal + taxTotal - discountTotal;
      body.balance = body.total - (body.amountPaid || 0);
    }
    
    // If customer ID is provided but customer name is not, fetch customer name
    if (body.customer && !body.customerName) {
      const customer = await Customer.findById(body.customer);
      if (customer) {
        body.customerName = customer.name;
      }
    }
    
    // Create the invoice
    const invoice = await Invoice.create(body);
    
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    
    // Type guard to check if error is an object with a name property
    if (error instanceof Error) {
      // Type guard for ValidationError
      if (error.name === 'ValidationError' && 'errors' in error) {
        // For MongoDB ValidationError
        const mongoError = error as Error & { errors: Record<string, { message: string }> };
        const validationErrors = Object.values(mongoError.errors).map((err) => err.message);
        return NextResponse.json(
          { error: validationErrors.join(', ') },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
} 