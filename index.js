const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');
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
        const htmlString = content     // Parse the HTML string
        // Parse the HTML string

        // Parse the HTML string
        const dom = new JSDOM(htmlString);
        const doc = dom.window.document;

        // Extract data with safety checks
        const transactionLinkElement = doc.querySelector('.sc-eTpRJs a');
        const transactionLink = transactionLinkElement ? transactionLinkElement.outerHTML : null;

        const elements = doc.querySelectorAll('.sc-eTpRJs.jpIzVy.css-1n3zwju');
        const inToken = elements[1] ? elements[1].textContent.trim() : null;
        const outToken = elements[2] ? elements[2].textContent.trim() : null;

        const totalValueElement = doc.querySelector('.sc-eTpRJs.css-4cffwv');
        const totalValue = totalValueElement ? totalValueElement.textContent.trim() : null;

        const tokenAmounts = doc.querySelectorAll('.sc-eTpRJs.css-4cffwv');
        const tokenAmount1 = tokenAmounts[1] ? tokenAmounts[1].childNodes[0].textContent.trim() + ' ' + doc.querySelectorAll('.sc-hZSUBg.jwNVwE')[0]?.textContent.trim() : null;
        const tokenAmount2 = tokenAmounts[2] ? tokenAmounts[2].childNodes[0].textContent.trim() + ' ' + doc.querySelectorAll('.sc-hZSUBg.jwNVwE')[1]?.textContent.trim() : null;

        const timeElement = tokenAmounts[3];
        const time = timeElement ? timeElement.textContent.trim() : null;

        const transactionDetails = {
            transactionLink: transactionLink,
            in: inToken,
            out: outToken,
            totalValue: totalValue,
            tokenAmount1: tokenAmount1,
            tokenAmount2: tokenAmount2,
            time: time
        };

        console.log(transactionDetails);
        console.log('-----------------------------');

    });

    // Close the browser
    await browser.close();
})();
