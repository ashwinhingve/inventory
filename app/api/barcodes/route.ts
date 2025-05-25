import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Item from '@/models/item';

interface BarcodeQuery {
  barcode: { $exists: boolean; $ne: string };
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
  category?: string;
}

// GET items with barcodes
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    
    // Build query
    const query: BarcodeQuery = {
      barcode: { $exists: true, $ne: '' }
    };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Get items
    const items = await Item.find(query)
      .sort({ name: 1 })
      .limit(100);  // Limit to 100 products for performance reasons
    
    // Get unique categories for filter options
    const categories = await Item.distinct('category', { barcode: { $exists: true, $ne: '' } });
    
    return NextResponse.json({
      success: true,
      products: items,
      filters: {
        categories
      }
    });
  } catch (error) {
    console.error('Error in GET /api/barcodes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products with barcodes' },
      { status: 500 }
    );
  }
}

// POST to generate or update a barcode
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.itemId || !body.barcode) {
      return NextResponse.json(
        { success: false, error: 'Item ID and barcode are required' },
        { status: 400 }
      );
    }
    
    // Update item with barcode
    const updatedItem = await Item.findByIdAndUpdate(
      body.itemId,
      { barcode: body.barcode },
      { new: true }
    );
    
    if (!updatedItem) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      product: updatedItem,
      message: 'Barcode updated successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/barcodes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update barcode' },
      { status: 500 }
    );
  }
} 