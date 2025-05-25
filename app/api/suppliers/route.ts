import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Supplier from '@/models/supplier';

export async function GET() {
  try {
    await connectToDB();
    
    const suppliers = await Supplier.find().sort({ name: 1 });
    
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Supplier name is required' },
        { status: 400 }
      );
    }
    
    // Check if supplier with same name already exists
    const existingSupplier = await Supplier.findOne({ name: body.name });
    if (existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier with this name already exists' },
        { status: 400 }
      );
    }
    
    const supplier = await Supplier.create(body);
    
    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
} 