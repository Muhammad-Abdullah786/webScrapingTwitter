import sleep from "./sleepFn.js";

export async function gatherMedia(page) {
    await page.setRequestInterception(true);

    return await page.evaluate(() => {
        const result = [];
        const posts = document.querySelectorAll('[data-testid="tweet"], article');

        Array.from(posts).forEach((post) => {
            const images = [];
            const hasVideo = !!post.querySelector('video');

            const imgTags = post.querySelectorAll('img');
            imgTags.forEach(img => {
                if (img.src && img.src.includes('media')) {
                    const cleaned = img.src.replace(/name=\w+/, 'name=orig');
                    images.push({ type: 'image', url: cleaned });
                }
            });

            const tweetElem = post.querySelector('div[lang]');
            const tweetText = tweetElem ? tweetElem.innerText.trim() : '';

            const timeElem = post.querySelector('time');
            const time = timeElem ? timeElem.getAttribute('datetime') : null;

            if (images.length > 0) {
                images.forEach(data => {
                    result.push({
                        url: data.url,
                        type: 'image',
                        tweet: tweetText,
                        time
                    });
                });
            }

            if (hasVideo) {
                result.push({
                    url: 'video-url',//? i will get this url from the intercept network
                    type: 'video',
                    tweet: tweetText,
                    time
                });
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







