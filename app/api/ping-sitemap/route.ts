export async function GET() {
  const sitemapUrl = 'https://toolkitonline.vip/sitemap.xml';
  const indexNowKey = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';

  const results: { service: string; status: number }[] = [];

  try {
    const googleRes = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    );
    results.push({ service: 'google', status: googleRes.status });
  } catch {
    results.push({ service: 'google', status: 0 });
  }

  try {
    const bingRes = await fetch(
      `https://www.bing.com/indexnow?url=${encodeURIComponent(sitemapUrl)}&key=${indexNowKey}`
    );
    results.push({ service: 'bing', status: bingRes.status });
  } catch {
    results.push({ service: 'bing', status: 0 });
  }

  return Response.json({ pinged: true, results });
}
