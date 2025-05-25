import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Customer from '@/models/customer';
import Invoice from '@/models/invoice';
import Payment from '@/models/payment';

interface CustomerStats {
  invoiceCount: number;
  totalSales: number;
  totalPayments: number;
  outstandingBalance: number;
}

interface ValidationError extends Error {
  name: string;
  errors: Record<string, { message: string }>;
}

// GET handler - get a single customer by ID
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    await connectToDB();
    
    const customer = await Customer.findById(id);
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // Get additional customer info such as invoice count and total sales
    const invoiceCount = await Invoice.countDocuments({ customer: id });
    const invoices = await Invoice.find({ customer: id });
    
    // Calculate total sales from invoices
    const totalSales = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    
    // Calculate total payments
    const payments = await Payment.find({ 
      customer: id,
      type: 'incoming',
      status: 'Completed'
    });
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calculate outstanding balance
    const outstandingBalance = totalSales - totalPayments;
    
    return NextResponse.json({
      ...customer.toObject(),
      stats: {
        invoiceCount,
        totalSales,
        totalPayments,
        outstandingBalance
      } as CustomerStats
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT handler - update a customer
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    await connectToDB();
    
    const body = await request.json();
    
    // Check if customer exists
    const existingCustomer = await Customer.findById(id);
    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // Check if email is being changed and if it already exists
    if (body.email && body.email !== existingCustomer.email) {
      const customerWithEmail = await Customer.findOne({ email: body.email });
      if (customerWithEmail) {
        return NextResponse.json(
          { error: 'Email already in use by another customer' },
          { status: 400 }
        );
      }
    }
    
    // Update the customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    
    // Type guard for validation errors
    if (error instanceof Error) {
      if (error.name === 'ValidationError' && 'errors' in error) {
        const validationErr = error as ValidationError;
        const validationErrors = Object.values(validationErr.errors).map(err => err.message);
        return NextResponse.json(
          { error: validationErrors.join(', ') },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE handler - delete a customer
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    await connectToDB();
    
    // Check if customer exists
    const customer = await Customer.findById(id);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // Check if customer has related invoices
    const invoiceCount = await Invoice.countDocuments({ customer: id });
    if (invoiceCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete customer with existing invoices',
          invoiceCount 
        },
        { status: 400 }
      );
    }
    
    // Check if customer has related payments
    const paymentCount = await Payment.countDocuments({ customer: id });
    if (paymentCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete customer with existing payments',
          paymentCount 
        },
        { status: 400 }
      );
    }
    
    // Delete the customer
    await Customer.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
} 