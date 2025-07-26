import fs from 'fs';
import manualLogin from './utility/manualLogin.js';
import sleep from './utility/sleepFn.js';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import popupHandler from './utility/popupHandler.js';
import { gatherMedia } from './download-media/gatherMedia.js';
import Media from './mediaSchema.js';
import { interceptVideos } from './download-media/getVideoURL.js';
import { convertAllVideos } from './download-media/parallelDownload.js';
import { randomUUID } from 'crypto';
import { getAllVideos } from './utility/cloudinary.js';
import chalk from 'chalk';

puppeteer.use(StealthPlugin());

export default async function scrap({ link, maxPost, username, password }) {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
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
    const getingVideos = await getAllVideos()
    // console.log(`the data batch is ${getingVideos}`)
    let savedCount = 0;
    const processedTweetIds = new Set();
    const cloudinaryArray = []
    const videoMap = {};


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
            // console.log(`Video URLs: ${JSON.stringify(videoURL, null, 2)}`);
            // console.log(`Media items: ${JSON.stringify(mediaItems, null, 2)}`);


            if (videoURL.length > 0) {
                const { cloudinaryVideos } = await convertAllVideos(videoURL, cloudinaryArray);
                videoURL.forEach((videoObj, index) => {
                    //?videoUrl is an array but has different baseid,master,audio so i loop it and  
                    //? so video obj has this{
                    //?   "baseId": "1948462999162798080",
                    //?  "master": "https://video.twimg.com/amplify_video/1948462999162798080/pl/J4uVTVM6Rxvi4UKW.m3u8?variant_version=1&tag=14&v=cfc",
                    //? "video": "https://video.twimg.com/amplify_video/1948462999162798080/pl/avc1/320x568/vcDR8tbW4tipLdUN.m3u8",
                    //?  "audio": "https://video.twimg.com/amplify_video/1948462999162798080/pl/mp4a/32000/Q8uAA0m8YxME7Vce.m3u8"
                    //? }
                    //`` but i am just taking baseid
                    videoMap[videoObj.baseId] = cloudinaryVideos[index];
                });
            }
            console.log(chalk.yellow(`the results of video map after is  ${JSON.stringify(videoMap, 2, 2)}`))
            for (const item of mediaItems) {
                const { tweet, time, media } = item;

                const processedMedia = media.map(data => {
                    if (data.type === 'video') {
                        //>> here i am matching the url with base id (it is comming from gather media inside media arr)
                        const matching = videoMap[data.url]
                        // console.log(chalk.italic.greenBright(`this ic cloudinary url ${JSON.stringify(matching, 2, 2)}`))
                        return {
                            type: 'video',
                            url: matching,
                            originalUrl: data.url
                        };
                    } else {
                        return {
                            type: 'image',
                            url: data.url
                        };
                    }
                });
                const reCheckURL = processedMedia.map(video => video.url)
                // console.log(chalk.red(`the recheck url is ${JSON.stringify(reCheckURL, 2, 2)}`))
                const exists = await Media.exists({ 'media.url': reCheckURL });
                if (exists) {
                    console.log(`already exists: ${reCheckURL}`);
                    continue;
                }

                await Media.create({
                    from: link,
                    media: processedMedia,
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