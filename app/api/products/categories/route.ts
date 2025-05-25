import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Product from '@/models/product';
import { createDataFilter, hasPermission } from '@/lib/userContext';
import { PERMISSIONS } from '@/models/user';

export async function GET(req: NextRequest) {
  try {
    await connectToDB();
    
    // Check if user has permission to view inventory (which includes products)
    const hasViewPermission = await hasPermission(req, PERMISSIONS.VIEW_INVENTORY);
    if (!hasViewPermission) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to view product categories' },
        { status: 403 }
      );
    }
    
    // Get user-specific data filter - critical for data isolation
    const dataFilter = await createDataFilter(req);
    
    // Get unique categories with user-specific filter
    const categories = await Product.distinct('category', dataFilter);
    
    // Filter out null or empty categories and sort alphabetically
    const filteredCategories = categories
      .filter(category => category && category.trim() !== '')
      .sort((a, b) => a.localeCompare(b));
    
    // Rate limit the response to prevent abuse
    const responseHeaders = new Headers();
    responseHeaders.set('X-RateLimit-Limit', '100');
    responseHeaders.set('Cache-Control', 'private, max-age=300'); // 5 min cache for authenticated users
    
    return NextResponse.json({
      success: true,
      categories: filteredCategories
    }, {
      headers: responseHeaders
    });
  } catch (error) {
    console.error('Error fetching product categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product categories' },
      { status: 500 }
    );
  }
}