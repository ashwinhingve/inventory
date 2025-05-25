import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Payment from '@/models/payment';
import Invoice from '@/models/invoice';
import Customer from '@/models/customer';
import Supplier from '@/models/supplier';

// Define interfaces for related data
interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  total: number;
  balance: number;
  status: string;
}

interface EntityData {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface RelatedData {
  invoice?: InvoiceData;
  customer?: EntityData;
  supplier?: EntityData;
}

interface ValidationError extends Error {
  name: string;
  errors: Record<string, { message: string }>;
}

// GET handler - get a single payment by ID
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    await connectToDB();
    
    const payment = await Payment.findById(id);
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    // Get related entities
    const relatedData: RelatedData = {};
    
    // Get invoice details if it exists
    if (payment.invoice) {
      const invoice = await Invoice.findById(payment.invoice);
      if (invoice) {
        relatedData.invoice = {
          _id: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.date,
          dueDate: invoice.dueDate,
          total: invoice.total,
          balance: invoice.balance,
          status: invoice.status
        };
      }
    }
    
    // Get customer details if it exists
    if (payment.customer) {
      const customer = await Customer.findById(payment.customer);
      if (customer) {
        relatedData.customer = {
          _id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone
        };
      }
    }
    
    // Get supplier details if it exists
    if (payment.supplier) {
      const supplier = await Supplier.findById(payment.supplier);
      if (supplier) {
        relatedData.supplier = {
          _id: supplier._id,
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone
        };
      }
    }
    
    return NextResponse.json({
      ...payment.toObject(),
      relatedData
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}

// PUT handler - update a payment
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    await connectToDB();
    
    const body = await request.json();
    
    // Check if payment exists
    const existingPayment = await Payment.findById(id);
    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    // If the payment was linked to an invoice and the amount is changing,
    // we need to update the invoice's amountPaid and status
    if (existingPayment.invoice && existingPayment.type === 'incoming' && 
        (body.amount !== undefined || body.status !== undefined)) {
      
      const invoice = await Invoice.findById(existingPayment.invoice);
      
      if (invoice) {
        // Handle amount changes
        if (body.amount !== undefined && body.amount !== existingPayment.amount) {
          // Calculate the difference
          const amountDifference = body.amount - existingPayment.amount;
          
          // Update the invoice's amountPaid
          const newAmountPaid = invoice.amountPaid + amountDifference;
          const newBalance = invoice.total - newAmountPaid;
          
          // Determine new status
          let newStatus;
          if (newAmountPaid >= invoice.total) {
            newStatus = 'Paid';
          } else if (newAmountPaid > 0) {
            newStatus = 'Partial';
          } else {
            newStatus = 'Unpaid';
          }
          
          // Update the invoice
          await Invoice.findByIdAndUpdate(existingPayment.invoice, {
            amountPaid: newAmountPaid,
            balance: newBalance,
            status: newStatus
          });
        }
        
        // Handle status changes
        else if (body.status !== undefined && body.status !== existingPayment.status) {
          // If the payment was completed but now isn't, or vice versa
          if ((existingPayment.status === 'Completed' && body.status !== 'Completed') ||
              (existingPayment.status !== 'Completed' && body.status === 'Completed')) {
            
            // Adjust the invoice's amountPaid
            const amountChange = body.status === 'Completed' ? existingPayment.amount : -existingPayment.amount;
            const newAmountPaid = invoice.amountPaid + amountChange;
            const newBalance = invoice.total - newAmountPaid;
            
            // Determine new status
            let newStatus;
            if (newAmountPaid >= invoice.total) {
              newStatus = 'Paid';
            } else if (newAmountPaid > 0) {
              newStatus = 'Partial';
            } else {
              newStatus = 'Unpaid';
            }
            
            // Update the invoice
            await Invoice.findByIdAndUpdate(existingPayment.invoice, {
              amountPaid: newAmountPaid,
              balance: newBalance,
              status: newStatus
            });
          }
        }
      }
    }
    
    // Update the payment
    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error('Error updating payment:', error);
    
    // Handle validation errors
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
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

// DELETE handler - delete a payment
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    await connectToDB();
    
    // Check if payment exists
    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    // If payment is linked to an invoice, update the invoice
    if (payment.invoice && payment.type === 'incoming' && payment.status === 'Completed') {
      const invoice = await Invoice.findById(payment.invoice);
      
      if (invoice) {
        // Adjust the invoice's amountPaid and status
        const newAmountPaid = invoice.amountPaid - payment.amount;
        const newBalance = invoice.total - newAmountPaid;
        
        // Determine new status
        let newStatus;
        if (newAmountPaid >= invoice.total) {
          newStatus = 'Paid';
        } else if (newAmountPaid > 0) {
          newStatus = 'Partial';
        } else {
          newStatus = 'Unpaid';
        }
        
        // Update the invoice
        await Invoice.findByIdAndUpdate(payment.invoice, {
          amountPaid: newAmountPaid,
          balance: newBalance,
          status: newStatus
        });
      }
    }
    
    // Delete the payment
    await Payment.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
} 