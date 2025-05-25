import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Item from '@/models/item';

interface ItemQuery {
  userId?: string;
  $or?: Array<{
    name?: { $regex: string; $options: string };
    sku?: { $regex: string; $options: string };
    category?: { $regex: string; $options: string };
  }>;
  category?: string;
  barcode?: { $exists: boolean; $ne: string };
}

interface SortOptions {
  [key: string]: 1 | -1;
}

// GET all items

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortField = searchParams.get('sort') || 'createdAt';
    const sortOrder = searchParams.get('order') || 'desc';

    const query: ItemQuery = { userId: session.user.id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const sort: SortOptions = {
      [sortField]: sortOrder === 'asc' ? 1 : -1
    };

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Item.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Item.countDocuments(query),
    ]);

    const categories = await Item.distinct('category', { userId: session.user.id });

    return NextResponse.json({
      success: true,
      items,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
      categories,
    });
  } catch (error) {
    console.error('Error in GET /api/items:', error);
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST a new item
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const data = await req.json();
    data.userId = session.user.id;

    // Generate barcode if not provided
    if (!data.barcode) {
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      data.barcode = `${timestamp}${random}`;
    }

    const item = await Item.create(data);
    
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error in POST /api/items:', error);
    const err = error as Error & { code?: number };
    return NextResponse.json(
      { 
        success: false, 
        error: err.code === 11000 ? 'Duplicate barcode found' : err.message || 'Internal server error'
      },
      { status: err.code === 11000 ? 400 : 500 }
    );
  }
} 