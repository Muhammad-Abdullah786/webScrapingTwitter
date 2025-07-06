import fs from 'fs';
import https from 'https';
import manualLogin from './utility/manualLogin.js';
import sleep from './utility/sleepFn.js';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import Image from './imageSchema.js';
import popupHandler from './utility/popupHandler.js';
import { gatherImage, autoScroll } from './utility/gatherImage.js'

puppeteer.use(StealthPlugin());


export default async function scrap() {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
    const link = 'https://x.com/adultfavorite'


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
            await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });
            await sleep(8000)
        } else {
            await manualLogin(page);
            await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });
            await sleep(8000)

        }


    }



    let sensitiveData = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('span')).some(element => element.innerText.toLowerCase().includes("potentially sensitive content"))
    })
    if (sensitiveData) {
        await popupHandler(page)
        await sleep(3000)
    }
    await autoScroll(page, 1000, 20)
    let imagesUrl = await gatherImage(page)

    if (imagesUrl.length === 0) {
        // todo maybe i need to scroll or check for captha etc
        console.log('error no image')
    } else {
        console.log(`🖼️ Received images ${imagesUrl.length} `);
        let uniqueImg = Array.from(new Set(imagesUrl)) // ? now putting in set object then converting into array
        for (let i = 0; i < uniqueImg.length; i++) {
            let url = uniqueImg[i]
            // `` checking if same img not exist in db
            const exist = await Image.exists({ url })
            if (!exist) {
                await Image.create({
                    from: link,
                    url: url,
                })
                console.log(`image saved ${uniqueImg[i]}`)
            } else {
                console.log(`already exist moving on`)
            }
        }

    }

    // await browser.close();
}


