const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const transactions = [];
    const baseUrl = 'https://app.thoryield.com/transactions?page=';

    let currentPage = 1;

    while (true) {
        console.log(`Loading page ${currentPage}...`);
        await page.goto(`${baseUrl}${currentPage}&pool=BTC.BTC&type=swap`, {
            waitUntil: 'networkidle2'
        });

        await page.waitForSelector('.sc-eTpRJs.jpIzVy.css-4cffwv');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
        const contents = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.sc-ugnQR.hYpnlV'));
            return elements.map(element => element.innerHTML);
        });

        let foundRecentTransaction = false; // Flag to check for recent transactions

        contents.forEach((content) => {
            const dom = new JSDOM(content);
            const doc = dom.window.document;

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

            const transactionDate = new Date(time);
            const last30Days = new Date();
            last30Days.setHours(last30Days.getHours() - 2);
            // last30Days.setDate(last30Days.getDate() - 30);

            if (transactionDate >= last30Days) {
                foundRecentTransaction = true; // Mark that we found a recent transaction
                transactions.push({
                    transactionLink,
                    in: inToken,
                    out: outToken,
                    totalValue,
                    tokenAmount1,
                    tokenAmount2,
                    time
                });
            }
        });

        // Stop if no recent transactions were found on this page
        if (!foundRecentTransaction) {
            break;
        }

        currentPage++;
    }

    const csvContent = [
        'Transaction Link,In,Out,Total Value,Token Amount 1,Token Amount 2,Time',
        ...transactions.map(tx => [
            tx.transactionLink,
            tx.in,
            tx.out,
            tx.totalValue,
            tx.tokenAmount1,
            tx.tokenAmount2,
            tx.time
        ].join(','))
    ].join('\n');

    fs.writeFileSync(path.join(__dirname, 'transactions.csv'), csvContent);
    console.log('CSV file has been created: transactions.csv');

    await browser.close();
})();
