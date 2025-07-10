import fs from 'fs';
import manualLogin from './utility/manualLogin.js';
import sleep from './utility/sleepFn.js';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import popupHandler from './utility/popupHandler.js';
import { gatherMedia, autoScroll } from './utility/gatherMedia.js'
import Media from './mediaSchema.js';
import { interceptVideos } from './utility/downloadVideo.js';

puppeteer.use(StealthPlugin());


export default async function scrap() {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
    const link = 'https://x.com/trackingisrael'


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
    let allPosts = new Set();
    let scrollAttempt = 0;
    let maxScroll = 3;
    let maxPost = 1;
    while (allPosts.size < maxPost && scrollAttempt < maxScroll) {
        await autoScroll(page, 1000, 10)
        await sleep(6000)
        const getVideos = await interceptVideos(page)
        let { result: mediaItem, hasVideo } = await gatherMedia(page)

        for (const item of mediaItem) {
            console.log(`scroll attempt done ${scrollAttempt}`)
            console.log(`the videos are ${getVideos.pop()}`)
            const { tweet, time, url, type } = item
            //>> skiping previw video images
            if (type === 'video' && (url.startsWith('blob:') || url.endsWith('.jpg'))) {
                continue;
            }
            const exist = await Media.exists({ url })
            if (exist) {
                console.log(`it already exist ${url}`)
            } else {
                allPosts.add(item)
                await Media.create({
                    from: link,
                    url: type === 'video' ? getVideos.pop() : url,
                    type,
                    time,
                    tweet
                })
                // console.log(`saved ${type} and url is ${url}`)
            }
        }
        console.log(`post saved ${allPosts.size}`)
        scrollAttempt++
    }

    if (allPosts.size === 0) {

        // todo maybe i need to scroll or check for captha etc

        console.log('error no image')
    } else {
        console.log(`🖼️ Received images ${allPosts.size} `);

    }



    // await browser.close();
}


