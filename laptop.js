const puppeteer = require("puppeteer");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
async function laptop() {
    try {
        let browserObj = await puppeteer.launch({
            headless: false,
            defaultViewport: null
        })
        let page = await browserObj.newPage();
        await page.goto("https://www.flipkart.com");
        await page.waitForSelector("._2KpZ6l._2doB4z",{ visible: true});
        await page.click("._2KpZ6l._2doB4z", { delay: 1000 });
        await page.type("._3704LK", "Laptops");
        await page.click(".L0Z3Pu");
        let url = await page.url();
        await page.waitForSelector("._213eRC._2ssEMF", { visible: true });
        let brandclick = await page.$$("._213eRC._2ssEMF");
        await brandclick[1].click();
        let morebrands = await page.$$(".QvtND5._2w_U27");
        await morebrands[1].click();
        await page.waitForSelector("._4921Z.t0pPfW", { visible: true });
        let companyArray = await page.$$("._4921Z.t0pPfW");
        let i = 0;
        for (const el of companyArray) {
            if (i > 5 && i < 25) {
                let companyname = await page.evaluate(function (item) {
                    return item.textContent;
                }, el)
                await findCompanyInNewPage(url, browserObj, companyname, i);
            }
            i++;
        }

    }
    catch (e) {
        console.log(e);
    }

}
async function findCompanyInNewPage(url, browserObj, companyname, number) {
    try {
        let page = await browserObj.newPage();
        page.goto(url);
        await page.waitForNavigation({ waitUntil: "networkidle0" });
        await page.waitForSelector("._213eRC._2ssEMF", { visible: true });
        let brandclick = await page.$$("._213eRC._2ssEMF");
        await brandclick[1].click();
        let morebrands = await page.$$(".QvtND5._2w_U27");
        await morebrands[1].click();
        await page.waitForSelector("._4921Z.t0pPfW", { visible: true });
        let elHandleArray = await page.$$("._4921Z.t0pPfW");
        await page.waitFor(5000);
        let i = 0;
        for (const el of elHandleArray) {
            if (i == number) {
                await processForSelectedCompany(el, page, companyname);
            }
            i++;
        }
        await page.close();
    }
    catch (e) {
        console.log(e);
    }
}

async function processForSelectedCompany(el, page, companyname) {
    try {
        await page.waitFor(2000);
        await el.click();
        await page.waitFor(2000);
        await page.waitForSelector("._2id1nE", { visible: true });
        let sortPriceClick = await page.$$("._10UF8M");
        await page.evaluate(function (item) {
            item.click();
        }, sortPriceClick[2]);
        await page.waitFor(2000)

        let checkForLaptopFolder=path.join(__dirname,"Laptops");
        if(fs.existsSync(checkForLaptopFolder) == false)
        {
            fs.mkdirSync(checkForLaptopFolder);
        }


        let itemnames = await page.$$("._4rR01T");
        let itemprices = await page.$$("._30jeq3._1_WHN1");
        let itemlinks = await page.$$("._1fQZEK");
        let pdfDoc = new PDFDocument;
        let companyNamePdf =path.join(checkForLaptopFolder,companyname + ".pdf");
        let j = 1;
        pdfDoc.pipe(fs.createWriteStream(companyNamePdf));
        for (let i = 0; i < itemprices.length; i++) {

            let itemname = await page.evaluate(function (item) {
                return item.textContent;
            }, itemnames[i]);

            let itemprice = await page.evaluate(function (item) {
                return item.textContent;
            }, itemprices[i]);
            itemprice = itemprice.split("₹").pop();

            let itemlink = await page.evaluate(function (item) {
                return item.getAttribute("href");
            }, itemlinks[i]);
            itemlink = "https://www.flipkart.com" + itemlink;

            let tempLaptopData = j + ")  " + itemname + "  --> " + itemprice;
            pdfDoc.text(tempLaptopData, { link: itemlink });
            pdfDoc.moveDown();
            j++;
        }
        pdfDoc.end();
    }
    catch (e) {
        console.log(e.message);
    }
}


module.exports = {
    main: laptop
}