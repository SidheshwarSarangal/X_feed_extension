const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();

  const cookies = [
    { name: '__cf_bm', value: 'guOZU8l2k1fwUS_HDeAeUHP8k8bfgYTxQuItf7NshQ0-1751004102-1.0.1.1-ffFG2OKMc4fe5zmNC2Ua.vf0XbK_BVGMC7WQal3X7EFZNY5pAZeSSfnmzOR2YA.9TY2j37GhPkKG2381FHiLKOJ.OgxKnROPuDWnRk9BbrE' },
    { name: 'auth_token', value: 'f989e9c28dee60617af73038e8c0951821378c5f' },
    { name: 'ct0', value: '5050353c85079cd263a5de1b1768eb4a350fdc612d132e945e2bfea4495aa317e9a288c54def2af4426ab15684f02a06ac8297845c999e0cdd80c154e6a709bb8f50ce31223806ef9fd38903c058ca48' },
    { name: 'twid', value: 'u%3D1938132382479224834' },
    { name: 'kdt', value: '5YS5Z9pbqYeY7Vu4pzFXPayIaq5WrmECswZTCJgy' }
    // Add _twitter_sess if available from your browser
  ];

  // Set cookies
  const formattedCookies = cookies.map(c => ({
    name: c.name,
    value: c.value,
    domain: '.x.com',
    path: '/'
  }));
  await page.setCookie(...formattedCookies);

  // Set realistic headers
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://x.com/'
  });

  // Navigate to the page
  await page.goto('https://x.com/home', { waitUntil: 'networkidle0', timeout: 60000 });

  // Wait for feed content
  await page.waitForSelector('article', { timeout: 60000 }).catch(() => console.log('Feed content not found'));

  // Take a screenshot
  await page.screenshot({ path: 'feed.png', fullPage: true });
  console.log('Screenshot saved as feed.png');

  // Save HTML for reference
  const content = await page.content();
  fs.writeFileSync('new_feed.html', content);
  console.log('HTML saved as new_feed.html');

  await browser.close();
})();