export async function triggerWebsiteRevalidation() {
  const targets = Array.from(new Set([
    process.env.MAIN_WEBSITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    'https://cgl-sable.vercel.app',
    'http://localhost:3000',
  ].filter(Boolean))) as string[];

  const promises = targets.map(async (baseUrl) => {
    try {
      const url = `${baseUrl.replace(/\/+$/, '')}/api/revalidate?tag=site-data`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(4000), // Avoid hanging if an endpoint is unreachable
      });
      return { url, status: res.status, ok: res.ok };
    } catch (e: any) {
      // Non-blocking, safe fail
      return { url: baseUrl, error: e?.message || 'timeout/unreachable' };
    }
  });

  // Run in background without blocking API response
  Promise.allSettled(promises).catch(() => null);
}
