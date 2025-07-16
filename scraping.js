import fs from 'fs';
import manualLogin from './utility/manualLogin.js';
import sleep from './utility/sleepFn.js';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import popupHandler from './utility/popupHandler.js';
import { gatherMedia, autoScroll } from './download-media/gatherMedia.js';
import Media from './mediaSchema.js';
import { interceptVideos } from './download-media/getVideoURL.js';
import { convertAllVideos } from './download-media/parallelDownload.js';
import { randomUUID } from 'crypto';

puppeteer.use(StealthPlugin());

export default async function scrap({ link, maxPost, username, password }) {
    console.log(`🚀 Received parameters:
  link: ${link}
  maxPost: ${maxPost}
  username: ${username}
  password: ${'*'.repeat(password.length)}
`); const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
    let groupedVideos = {};

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: '/usr/bin/google-chrome-stable',
        defaultViewport: null,
    });
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);

    await page.goto('https://x.com/home', { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(10000);
    await interceptVideos(page, groupedVideos);

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
        } else {
            await manualLogin(page, username, password);
        }
        await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });

    }

    let sensitiveData = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('span')).some(element =>
            element.innerText.toLowerCase().includes("potentially sensitive content")
        );
    });
    if (sensitiveData) {
        await popupHandler(page);
        await sleep(3000);
    }

    let savedCount = 0;
    const processedTweetIds = new Set();
    const cloudinaryArray = []


    while (savedCount < maxPost) {
        const tweets = await page.$$('article');

        for (const tweet of tweets) {
            const tweetId = await tweet.evaluate(el => {
                const anchor = el.querySelector('a[href*="/status/"]');
                const timeEl = el.querySelector('time');
                if (anchor) return anchor.href.match(/status\/(\d+)/)?.[1];
                if (timeEl) return timeEl.getAttribute('datetime');
                return el.innerText.slice(0, 30);
            });

            if (processedTweetIds.has(tweetId)) {
                console.log(`⏩ Already processed tweet: ${tweetId}`);
                continue;
            }
            console.log(`🔄 Processing new tweet: ${tweetId}`);
            processedTweetIds.add(tweetId);

            await tweet.scrollIntoViewIfNeeded();
            await sleep(2000);

            const videoURL = await interceptVideos(page, groupedVideos);
            const mediaItems = await gatherMedia(page);
            console.log(`Video URLs: ${JSON.stringify(videoURL, null, 2)}`);
            // console.log(`Media items: ${JSON.stringify(mediaItems, null, 2)}`);

            const cloudinaryVideos = videoURL.length > 0 ? await convertAllVideos(videoURL, cloudinaryArray) : [];
            console.log(`the array of cloudinary are ${JSON.stringify(cloudinaryArray, 2, 2)}`)
            for (const item of mediaItems) {
                const { tweet, time, url, type } = item;

                let finalUrl = url;
                if (type === 'video') {
                    if (!videoURL || videoURL.length === 0 || !cloudinaryVideos.length) {
                        finalUrl = randomUUID();
                        console.log(`the video url is empty for baseId: ${url}`);
                    } else {
                        const cloudinaryUrl = cloudinaryVideos.find(cUrl =>
                            cUrl.includes(`/twitter_videos/${url}.mp4`)
                        );
                        finalUrl = cloudinaryUrl || randomUUID();
                        console.log(`'''''''''''''''''''''''''''''''''''''''\n Matched Cloudinary URL for baseId ${url}: ${finalUrl}`);
                    }
                }

                const exists = await Media.exists({ url: finalUrl });
                if (exists) {
                    console.log(`already exists: ${finalUrl}`);
                    continue;
                }

                await Media.create({
                    from: link,
                    url: finalUrl,
                    type,
                    time,
                    tweet
                });

                savedCount++;
                console.log(`✅ Saved post ${savedCount}/${maxPost}`);

                if (savedCount >= maxPost) break;
            }

            if (savedCount >= maxPost) break;
        }

        if (savedCount >= maxPost) break;
    }

    await browser.close();
}