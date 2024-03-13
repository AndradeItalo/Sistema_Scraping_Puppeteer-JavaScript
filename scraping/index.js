const puppeteer = require('puppeteer');

(async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
  
    // Navigate the page to a URL
    await page.goto('https://www.kabum.com.br/');
    await page.screenshot({path: 'kabum.png'})
  
    await browser.close();
  })();

