import sleep from "./sleepFn.js";
let isListening = false
const videoUrls = new Set();

export async function interceptVideos(page) {
    if (!isListening) {
        await page.setRequestInterception(true);
        console.log(`🔍 started gathering videos`)

        page.on('request', (req) => {
            const url = req.url();
            if (url.includes('video.twimg.com') && url.includes('.m3u8')) {
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

        isListening = true
    }
    // videoUrls.clear()
    await sleep(5000);

    return Array.from(videoUrls);
}
