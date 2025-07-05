import fs from 'fs';
import https from 'https';
import manualLogin from './manualLogin.js';
import sleep from './sleepFn.js';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());


export default async function scrap() {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';



    const browser = await puppeteer.launch({
        headless: false,
        executablePath: '/usr/bin/google-chrome-stable',
        defaultViewport: null,

    });
    const page = await browser.newPage();

    await page.setUserAgent(userAgent);

    await page.goto('https://x.com/home', { waitUntil: 'networkidle2', timeout: 60000 });

    await sleep(10000);

    // ? 🔍 Check if login
    const isLoginPage = await page.evaluate(() => {
        return (
            document.querySelector('input[name="text"]') !== null ||
            document.body.innerText.toLowerCase().includes('log in to x')
        );
    });

    if (isLoginPage) {
        console.log("🔒 Login is required to access this page.");
        if (fs.existsSync('./cookies.json')) {
            const cookies = JSON.parse(fs.readFileSync('./cookies.json', 'utf-8'));
            await page.setCookie(...cookies);
            console.log("🍪 Cookies loaded and applied");
            await page.goto('https://x.com/home', { waitUntil: 'networkidle2', timeout: 60000 });
            await sleep(8000)
        } else {
            await manualLogin(page);
            await page.goto('https://x.com/home', { waitUntil: 'networkidle2', timeout: 60000 });
            await sleep(8000)

        }


    }



    // ! scraping
    const imagesUrl = await page.evaluate(() => {
        const setImage = Array.from(document.querySelectorAll('img'));
        return setImage
            .map(img => img.src)
            .filter(src => src.includes('media'))
            .map(src => src.replace(/name=\w+/, 'name=orig'));
    });

    console.log('🖼️ Received image set:', imagesUrl);

    imagesUrl.slice(0, 10).forEach((url, index) => {
        https.get(url, res => {
            res.pipe(fs.createWriteStream(`image${index + 1}.jpg`));
        });
    });

    await browser.close();
}


