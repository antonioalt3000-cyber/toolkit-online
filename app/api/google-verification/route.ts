import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse(
    'google-site-verification: google1423c27583e4abe5.html',
    {
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
}
