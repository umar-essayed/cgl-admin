export async function triggerWebsiteRevalidation() {
  const targets = [
    process.env.MAIN_WEBSITE_URL || 'http://localhost:3000',
    process.env.BLUE_WEBSITE_URL || 'http://localhost:3001',
    'https://cgl-sable.vercel.app',
    'https://cgl-blue.vercel.app',
  ];

  const promises = targets.map((baseUrl) => {
    return fetch(`${baseUrl.replace(/\/+$/, '')}/api/revalidate?tag=site-data`, {
      method: 'POST',
    }).catch(() => null);
  });

  // Non-blocking background revalidation
  Promise.allSettled(promises).catch(() => null);
}
