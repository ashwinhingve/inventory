import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sampleTemplate = {
      name: 'Sample Party',
      type: 'customer',
      status: 'active',
      email: 'sample@example.com',
      phone: '+1234567890',
      address: {
        street: '123 Main St',
        city: 'Sample City',
        state: 'Sample State',
        country: 'Sample Country',
        zipCode: '12345'
      }
    };
    
    return NextResponse.json({
      success: true,
      template: sampleTemplate
    });
  } catch (error) {
    console.error('Error generating sample template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate sample template' },
      { status: 500 }
    );
  }
} 