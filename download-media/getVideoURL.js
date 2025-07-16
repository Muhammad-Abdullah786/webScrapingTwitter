import sleep from "../utility/sleepFn.js";

const seenUrls = new Set();
let isListening = false;

export async function interceptVideos(page, groupedVideos) {
    if (Object.keys(groupedVideos).length === 20) {
        console.log(`tihs length os too long reseting `)
        groupedVideos = {}
    }
    if (!isListening) {
        await page.setRequestInterception(true);
        console.log("🔍 Interceptor started");

        page.on('request', (req) => {
            const url = req.url();
            if (
                url.includes('video.twimg.com') &&
                url.includes('.m3u8') &&
                !seenUrls.has(url)
            ) {
                seenUrls.add(url);

                const match = url.match(/amplify_video\/(\d+)\//);
                if (match) {
                    const baseId = match[1];
                    if (!groupedVideos[baseId]) {
                        groupedVideos[baseId] = {
                            baseId,
                            master: null,
                            video: null,
                            audio: null
                        };
                    }

                    if (url.includes('/avc1/')) {
                        groupedVideos[baseId].video = url;
                    } else if (url.includes('/mp4a/')) {
                        groupedVideos[baseId].audio = url;
                    } else {
                        groupedVideos[baseId].master = url;
                    }

                }
            }

            if (!req._interceptionHandled) {
                try {
                    req.continue();
                } catch (err) {
                    console.warn("⚠️ Request continue error:", err.message);
                }
            }
        });
        isListening = true;
    }

    await sleep(3000);
    // console.log(`the group video in intercep url is ${JSON.stringify(groupedVideos, 2, 2)}`)
    return Object.values(groupedVideos);
}
