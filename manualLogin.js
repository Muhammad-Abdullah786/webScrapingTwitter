import fs from 'fs'
import env from './env.js';
import sleep from './sleepFn.js';





export default async function manualLogin(page) {


    console.log('manual login is starting!! ');

    await sleep(6000)
    await page.waitForSelector('input[name="text"]', { timeout: 10000 });
    const usernameBox = await page.$('input[name="text"]');

    if (!usernameBox) {
        console.log('❌ Username field not found');
        return;
    }

    let box = await usernameBox.boundingBox();
    if (box) {
        await page.mouse.move(box.x + 10, box.y + 10);
        await sleep(1000);
    }
    await usernameBox.click();
    await sleep(2000);


    await usernameBox.click();
    await sleep(2000);
    await page.keyboard.type(env.USERNAME, { delay: 100 });
    await sleep(2000);

    await page.keyboard.press('Enter');
    await sleep(2500);

    // 👇 Wait for password field


    const passwordBox = await page.$('input[name="password"]', { timeout: 10000 });

    if (!passwordBox) {
        console.log('❌ pass field not found');
        return;
    }

    box = await passwordBox.boundingBox();
    if (box) {
        await page.mouse.move(box.x + 10, box.y + 10);
        await sleep(1000);
    }
    await passwordBox.click();
    await sleep(2000);







    await page.keyboard.type(env.PASSWORD, { delay: 100 });
    await sleep(5000);

    await page.keyboard.press('Enter');
    await sleep(3000);

    await page.evaluate(() => window.scrollBy(0, 100));
    await sleep(2000);
    await page.evaluate(() => window.scrollBy(0, -50));
    await sleep(2000);

    console.log("✅ Logged in successfully");

    const cookies = await page.cookies();
    fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
    console.log("🍪 Cookies saved");
}