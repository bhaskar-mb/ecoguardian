import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1587, height: 1122, deviceScaleFactor: 2 });

  const filePath = 'file:///' + path.resolve(__dirname, 'poster.html').replace(/\\/g, '/');
  console.log('Loading:', filePath);

  await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for Google Fonts and JS scaling to settle
  await new Promise(r => setTimeout(r, 3000));

  const outPath = path.resolve(__dirname, 'poster.pdf');
  await page.pdf({
    path: outPath,
    width:  '594mm',
    height: '420mm',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  await browser.close();
  console.log('\n✅ PDF saved to:', outPath);
})();
