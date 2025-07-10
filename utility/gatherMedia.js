import sleep from "./sleepFn.js";

export async function gatherMedia(page) {

    console.log(`started gathering data `)
    return await page.evaluate(() => {
        const result = [] // ?this will contail all data tweet, image/videos
        let hasVideo ;
        let post = document.querySelectorAll('[data-testid="tweet"] ,article');
        Array.from(post).forEach((post) => {
            let media = []// `` this is where i will save my images if ther is!!
            let images = post.querySelectorAll('img')
            images.forEach(img => {
                if (img.src && img.src.includes('media')) {
                    let cleanup = img.src.replace(/name=\w+/, 'name=orig')
                    media.push({ type: 'image', url: cleanup })
                }
            })// >>  here  image gathering is done

            //! since we cannot download video we will intercept in network and get the url
             hasVideo = !!post.querySelector('video')

            //>> got the tweet
            const textElem = post.querySelector('div[lang]');
            let tweet = textElem ? textElem.innerText.trim() : '';

            //>> got the time
            const timeElement = post.querySelector('time')
            let time = timeElement ? timeElement.getAttribute('datetime') : null;



            if (media.length > 0) {
                media.forEach((data => {
                    result.push({
                        url: data.url,
                        type: data.type,
                        tweet,
                        time
                    })
                }))
            }
        })





        return { result, hasVideo }
    })
}

export async function autoScroll(page, scrollDelay = 1000, maxScrolls = 10) {
    for (let i = 0; i < maxScrolls; i++) {
        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
        });
        await sleep(scrollDelay);
    }
}







