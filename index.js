const puppeteer = require('puppeteer');

(async () => {
    // Launch the browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Go to the specified URL
    await page.goto('https://app.thoryield.com/transactions?page=1&pool=BTC.BTC&type=swap', {
        waitUntil: 'networkidle2'
    });

    // Wait for the specific class to be loaded
    await page.waitForSelector('.sc-eTpRJs.jpIzVy.css-4cffwv');


    // Get the content of all elements with the specified class
    const contents = await page.evaluate(() => {
        // class="sc-ugnQR hYpnlV"
        const elements = Array.from(document.querySelectorAll('.sc-ugnQR.hYpnlV'));
        return elements.map(element => element.innerHTML); // Return an array of inner HTMLs
    });

    // Log each content to the console
    contents.forEach((content, index) => {
        console.log(content);
        console.log('-----------------');
        // console.log(`Content ${index + 1}:`, content);
    });

    // Close the browser
    await browser.close();
})();
