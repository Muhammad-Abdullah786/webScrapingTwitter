import sleep from "../utility/sleepFn.js";

export async function gatherMedia(page) {

    return await page.evaluate(() => {
        const result = [];
        const posts = document.querySelectorAll('[data-testid="tweet"], article');

        Array.from(posts).forEach((post) => {
            const mediaItems = []

            const tweetElem = post.querySelector('div[lang]');
            const tweetText = tweetElem ? tweetElem.innerText.trim() : '';
            const timeElem = post.querySelector('time');
            const time = timeElem ? timeElem.getAttribute('datetime') : null;

            const imgTags = post.querySelectorAll('img');
            imgTags.forEach(img => {
                if (img.src && img.src.includes('media')) {
                    const url = new URL(img.src)
                    url.searchParams.set('format', 'jpg')
                    url.searchParams.set('name', 'orig')
                    mediaItems.push({
                        type: 'image',
                        url: url.toString()
                    })
                }
            });


            const videoElement = Array.from(post.querySelectorAll('video'))
            videoElement.forEach((video) => {
                let posterUrl = video.getAttribute('poster')
                if (posterUrl) {
                    const match = posterUrl.match(/amplify_video_thumb\/(\d+)\//);
                    if (match) {
                        mediaItems.push({
                            type: 'video',
                            url: match[1]
                        })
                    }

                }
            })

            if (mediaItems.length > 0) {
                result.push({
                    tweet: tweetText,
                    time: time,
                    media: mediaItems

                })
            }
        });

        return result;
    });
}

export async function autoScroll(page, scrollDelay = 1000, maxScrolls = 10) {
    for (let i = 0; i < maxScrolls; i++) {
        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
        });
        await sleep(scrollDelay);
    }
}







