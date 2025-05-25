import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Payment from '@/models/payment';
import Customer from '@/models/customer';
import Supplier from '@/models/supplier';
import Invoice from '@/models/invoice';
import PurchaseOrder from '@/models/purchaseOrder';

// Helper function to generate next payment number
async function generatePaymentNumber(type: string) {
  try {
    // Get the latest payment by type, sorting by createdAt in descending order
    const prefix = type === 'incoming' ? 'RCPT' : 'PMT';
    const latestPayment = await Payment.findOne({ type }).sort({ createdAt: -1 });
    
    if (!latestPayment) {
      // If no payments exist yet, start with prefix-10001
      return `${prefix}-10001`;
    }
    
    // Extract the number from the latest payment number (assuming format PREFIX-#####)
    const latestNumber = parseInt(latestPayment.paymentNumber.split('-')[1], 10);
    const nextNumber = latestNumber + 1;
    
    // Format the new payment number with leading zeros
    return `${prefix}-${nextNumber}`;
  } catch (error) {
    console.error('Error generating payment number:', error);
    // Fallback to a timestamp-based number in case of errors
    return `${type === 'incoming' ? 'RCPT' : 'PMT'}-${Date.now()}`;
  }
}

// GET handler - get all payments with filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const method = searchParams.get('method') || '';
    const sortField = searchParams.get('sortField') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const fromDate = searchParams.get('fromDate') || '';
    const toDate = searchParams.get('toDate') || '';
    const entity = searchParams.get('entity') || ''; // Customer or Supplier ID
    
    // Build query based on filters
    const query: Record<string, string | Record<string, Date | { $regex: string; $options: string }> | Array<Record<string, { $regex: string; $options: string } | string>>> = {};
    
    // Search in payment number, customer name, or supplier name
    if (search) {
      query.$or = [
        { paymentNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Filter by payment type
    if (type) {
      query.type = type;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by method
    if (method && method !== 'all') {
      query.method = method;
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
    
    // Filter by entity (customer or supplier)
    if (entity) {
      query.$or = [
        { customer: entity },
        { supplier: entity }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Define sort options
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination and sorting
    const payments = await Payment.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Payment.countDocuments(query);
    
    return NextResponse.json({
      payments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST handler - create a new payment
export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    
    const body = await request.json();
    
    // Generate payment number if not provided
    if (!body.paymentNumber) {
      body.paymentNumber = await generatePaymentNumber(body.type);
    }
    
    // If customer ID is provided but customer name is not, fetch customer name
    if (body.type === 'incoming' && body.customer && !body.customerName) {
      const customer = await Customer.findById(body.customer);
      if (customer) {
        body.customerName = customer.name;
      }
    }
    
    // If supplier ID is provided but supplier name is not, fetch supplier name
    if (body.type === 'outgoing' && body.supplier && !body.supplierName) {
      const supplier = await Supplier.findById(body.supplier);
      if (supplier) {
        body.supplierName = supplier.name;
      }
    }
    
    // If invoice ID is provided but invoice number is not, fetch invoice number
    if (body.invoice && !body.invoiceNumber) {
      const invoice = await Invoice.findById(body.invoice);
      if (invoice) {
        body.invoiceNumber = invoice.invoiceNumber;
        
        // Also update the invoice with this payment if it's an incoming payment
        if (body.type === 'incoming' && body.status === 'Completed') {
          const newAmountPaid = invoice.amountPaid + body.amount;
          await Invoice.findByIdAndUpdate(body.invoice, {
            amountPaid: newAmountPaid,
            balance: invoice.total - newAmountPaid,
            status: newAmountPaid >= invoice.total ? 'Paid' : 
                   newAmountPaid > 0 ? 'Partial' : 'Unpaid'
          });
        }
      }
    }
    
    // If purchase order ID is provided but purchase order number is not, fetch purchase order number
    if (body.purchaseOrder && !body.purchaseOrderNumber) {
      const purchaseOrder = await PurchaseOrder.findById(body.purchaseOrder);
      if (purchaseOrder) {
        body.purchaseOrderNumber = purchaseOrder.orderNumber;
      }
    }
    
    // Create the payment
    const payment = await Payment.create(body);
    
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    
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
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
} 