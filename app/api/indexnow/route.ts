import { NextRequest, NextResponse } from 'next/server';

const INDEXNOW_KEY = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
const HOST = 'toolkitonline.vip';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body as { urls?: string[] };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty "urls" array in request body' },
        { status: 400 }
      );
    }

    // IndexNow accepts max 10,000 URLs per request
    if (urls.length > 10000) {
      return NextResponse.json(
        { error: 'Maximum 10,000 URLs per request' },
        { status: 400 }
      );
    }

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    };

    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 202) {
      return NextResponse.json({
        success: true,
        submitted: urls.length,
        status: response.status,
      });
    }

    const errorText = await response.text();
    return NextResponse.json(
      {
        success: false,
        status: response.status,
        error: errorText,
      },
      { status: response.status }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to verify the key
export async function GET() {
  return NextResponse.json({
    key: INDEXNOW_KEY,
    host: HOST,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
  });
}
