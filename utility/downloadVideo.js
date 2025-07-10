import sleep from "./sleepFn.js";

let isListening = false;
const videoUrls = new Set();

export async function interceptVideos(page) {
    // console.log(`started gathering videos`)
    if (!isListening) {
        await page.setRequestInterception(true);

        page.on('request', (req) => {
            const url = req.url();
            console.log(`the video url is ${url}`)
            if (url.includes('video.twimg.com') && url.includes('.m3u8') && req.resourceType() === 'media') {
                videoUrls.add(url);
            }

            // prevent double-handling errors
            if (!req._interceptionHandled) {
                try {
                    req.continue();
                } catch (err) {
                    console.warn("Request continue error:", err.message);
                }
            }
        });

        isListening = true;
    }

    // wait to give time for video requests to arrive
    await sleep(3000);

    return Array.from(videoUrls);
}
