const puppeteer = require("puppeteer");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const laptopObject = require('./laptop');
(async function () {

    try {
        let browserObj = await puppeteer.launch({
            headless: false,
            defaultViewport: null
        })
        let page = await browserObj.newPage();
        await page.goto("https://www.flipkart.com");
        await page.click("._2KpZ6l._2doB4z", { delay: 1000 });
        await page.type("._3704LK", "Smartphones");
        await page.click(".L0Z3Pu");
        let url = page.url();
        await page.waitForSelector(".QvtND5._2w_U27", { visible: true });
        await page.click(".QvtND5._2w_U27");
        const companyArray = await page.$$('._38vbm7 ._4921Z');
        let i = 0;
        for (const el of companyArray) {

            if (i < companyArray.length) {
                let companyname = await page.evaluate(function (item) {
                    return item.textContent;
                }, el)
                await findCompanyInNewPage(url, browserObj, i, companyname);
            }
            i++;
        }

        await laptopObject.main();
    }
    catch (e) {
        console.log(e);
    }
})()

async function findCompanyInNewPage(url, browserObj, number, companyname) {
    try {
        let p = await browserObj.newPage();
        p.goto(url);
        await p.waitForNavigation({ waitUntil: "networkidle0" });
        await p.waitForSelector(".QvtND5._2w_U27", { visible: true });
        await p.click(".QvtND5._2w_U27");
        await p.waitForSelector("._2BRIel", { visible: true });
        await p.click("._2BRIel", { delay: 2000 });
        const elHandleArray = await p.$$('._38vbm7 ._4921Z');
        let i = 0;
        for (const el of elHandleArray) {
            if (i == number) {
                await processForSelectedCompany(el, p, companyname);
            }
            i++;
        }
        await p.close();
    }
    catch (e) {
        console.log(e);
    }
}

async function processForSelectedCompany(el, pg, companyname) {
    try {
        await el.click();
        await pg.waitForSelector(".THxusM._3yuvK8");
        await pg.click(".THxusM._3yuvK8");
        await pg.waitFor(2000);
        let sortPriceClick = await pg.$$("._10UF8M");
        await pg.evaluate(function (item) {
            item.click();
        }, sortPriceClick[2]);
        await pg.waitFor(2000);

        let checkForSmartPhonesFolder = path.join(__dirname, "SmartPhones");
        if (fs.existsSync(checkForSmartPhonesFolder) == false) {
            fs.mkdirSync(checkForSmartPhonesFolder);
        }

        let pdfDoc = new PDFDocument;
        let companyNamePdf = path.join(checkForSmartPhonesFolder, companyname + ".pdf");
        pdfDoc.pipe(fs.createWriteStream(companyNamePdf));
        let itemnames = await pg.$$("._4rR01T");
        let itemprices = await pg.$$("._30jeq3._1_WHN1");
        let itemlinks = await pg.$$("._1fQZEK");
        let j = 1;
        for (let i = 0; i < itemprices.length; i++) {

            let itemname = await pg.evaluate(function (item) {
                return item.textContent;
            }, itemnames[i]);

            let itemprice = await pg.evaluate(function (item) {
                return item.textContent;
            }, itemprices[i]);

            itemprice = itemprice.split("₹").pop();

            let itemlink = await pg.evaluate(function (item) {
                return item.getAttribute("href");
            }, itemlinks[i]);
            itemlink = "https://www.flipkart.com" + itemlink;

            let tempmobiledata = j + ")  " + itemname + "  --> " + itemprice;
            pdfDoc.text(tempmobiledata, { link: itemlink });
            pdfDoc.moveDown();
            j++;
        }
        pdfDoc.end();
    }
    catch (e) {
        console.log(e);
    }
}
