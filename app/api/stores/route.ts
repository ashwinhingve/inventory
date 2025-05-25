import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Store from '@/models/store';

// GET endpoint to retrieve all stores
export async function GET() {
  try {
    await connectToDatabase();
    
    let stores = await Store.find()
      .sort({ name: 1 });
    
    // If no stores exist, create a default "Pro Store"
    if (stores.length === 0) {
      console.log('No stores found, creating default Pro Store');
      const defaultStore = new Store({
        name: 'Pro Store',
        location: 'Main Branch',
        manager: 'System',
        contact: '',
        isActive: true
      });
      
      const savedStore = await defaultStore.save();
      stores = [savedStore];
    }
    
    return NextResponse.json({
      success: true,
      stores
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stores' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new store
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Store name is required' },
        { status: 400 }
      );
    }
    
    const newStore = new Store({
      name: body.name,
      location: body.location || '',
      manager: body.manager || '',
      contact: body.contact || '',
      isActive: body.isActive !== undefined ? body.isActive : true,
    });
    
    const savedStore = await newStore.save();
    
    return NextResponse.json({
      success: true,
      store: savedStore
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error in POST /api/stores:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create store' },
      { status: 500 }
    );
  }
} 