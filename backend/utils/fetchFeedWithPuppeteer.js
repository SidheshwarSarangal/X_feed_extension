const puppeteer = require("puppeteer");

const fetchFeedWithPuppeteer = async (cookies) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setCookie(...cookies);
  await page.goto("https://twitter.com/home", { waitUntil: "networkidle2" });

  const content = await page.content();
  await browser.close();
  return content; // or scrape what you need from page
};

module.exports = fetchFeedWithPuppeteer;
