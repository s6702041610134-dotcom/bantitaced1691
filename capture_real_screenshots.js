const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const imagesDir = path.join(__dirname, 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  let launchOptions = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };

  const sysChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (fs.existsSync(sysChrome)) {
    launchOptions.executablePath = sysChrome;
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch(launchOptions);

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log('Navigating to https://vibeui.online/...');
  await page.goto('https://vibeui.online/', { waitUntil: 'networkidle2', timeout: 60000 });

  // Ensure light mode if toggle exists or default
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
  });

  await new Promise(r => setTimeout(r, 2000));

  // 1. Full page overview / library
  const overviewPath = path.join(imagesDir, 'vibeui_real_overview.jpg');
  await page.screenshot({ path: overviewPath, type: 'jpeg', quality: 90 });
  console.log('Saved:', overviewPath);

  // 2. Scroll to Hero Sections category or element
  const heroButton = await page.$('button ::-p-text(Hero Sections)');
  if (heroButton) {
    await heroButton.click();
    await new Promise(r => setTimeout(r, 1000));
  }
  const heroPath = path.join(imagesDir, 'vibeui_real_hero.jpg');
  await page.screenshot({ path: heroPath, type: 'jpeg', quality: 90 });
  console.log('Saved:', heroPath);

  // 3. Scroll to Features / Bento category
  const bentoButton = await page.$('button ::-p-text(Features / Bento)');
  if (bentoButton) {
    await bentoButton.click();
    await new Promise(r => setTimeout(r, 1000));
  }
  const bentoPath = path.join(imagesDir, 'vibeui_real_bento.jpg');
  await page.screenshot({ path: bentoPath, type: 'jpeg', quality: 90 });
  console.log('Saved:', bentoPath);

  await browser.close();
  console.log('All real screenshots captured successfully!');
})();
