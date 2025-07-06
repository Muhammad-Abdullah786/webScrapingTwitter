async function popupHandler(page) {
    console.log("🧠 Handling popup...");

    try {
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, div[role="button"], span'));
            buttons.forEach(btn => {
                const text = btn.innerText?.toLowerCase();
                if (
                    text &&
                    (
                        text.includes("view") ||
                        text.includes("yes") ||
                        text.includes("show") ||
                        text.includes("i understand") ||
                        text.includes("agree")
                    )
                ) {
                    btn.click();
                }
            });
        });
    } catch (err) {
        console.error("❌ Error in popupHandler:", err.message);
    }
}


export default popupHandler