import sleep from "./sleepFn.js";

export async function gatherImage(page) {

    // ! scraping
    const imagesUrl = await page.evaluate(() => {
        const setImage = Array.from(document.querySelectorAll('img'));
        return setImage
            .map(img => img.src)
            .filter(src => src.includes('media'))
            .map(src => src.replace(/name=\w+/, 'name=orig'));
    });
    return imagesUrl
}

export async function autoScroll(page, scrollDelay = 1000, maxScrolls = 10) {
    for (let i = 0; i < maxScrolls; i++) {
        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
        });
        await sleep(scrollDelay);
    }
}







