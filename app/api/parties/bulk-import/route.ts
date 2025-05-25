import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/mongodb';
import Party from '@/models/party';

// POST /api/parties/bulk-import - Import multiple parties at once
export async function POST(request: NextRequest) {
  try {
    await connectDb();
    
    // Parse multipart form data or JSON
    const contentType = request.headers.get('content-type') || '';
    let parties;
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file uploaded' },
          { status: 400 }
        );
      }
      
      // Parse Excel/CSV file
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Process the file and extract data
      // This would require additional libraries for Excel/CSV parsing
      // For simplicity, assuming JSON data is extracted
      const text = buffer.toString();
      parties = JSON.parse(text);
    } else {
      // Assuming JSON body with array of parties
      parties = await request.json();
    }
    
    if (!Array.isArray(parties)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected an array of parties.' },
        { status: 400 }
      );
    }
    
    // Process each party
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };
    
    for (const partyData of parties) {
      try {
        // Handle shipping address if same as billing
        if (partyData.sameShippingAddress && partyData.billingAddress) {
          partyData.shippingAddress = partyData.billingAddress;
        }
        
        await Party.create(partyData);
        results.success++;
      } catch (error) {
        results.failed++;
        const err = error as Error; 
        results.errors.push(`Error importing party "${partyData.name}": ${err.message}`);
      }
    }
    
    return NextResponse.json(results);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
} 