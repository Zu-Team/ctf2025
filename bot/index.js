const express = require('express');
const puppeteer = require('puppeteer');


const { FLAG, SECRET } = process.env;
const PORT = 3000;
const app = express();
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.redirect('/bot/');
});

app.get('/bot', (req, res) => {
    const { url, secret } = req.query;
    if (url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return res.end(`<h2>Invalid URL!</h2>`);
        }

        if(secret !== SECRET){
            return res.end("Invalid ADMIN_SECRET");
        }
        

        console.log('Submitted URL:', url);
        try {
            visit(url);
        } catch (e) {
            console.log(e);
        }

        return res.send(`<h2>Visiting ... </h2>`);
    }

    return res.send(`
        <html>
        <body>
            <h1>Submit a URL </h1>
            <form action="/bot/" method="GET">
            <input type="text" name="url" placeholder="Enter a URL" required />
            <input type="text" name="secret" placeholder="ADMIN_SECRET" />
            <button type="submit">Submit</button>
            </form>
        </body>
        </html>
    `);
});

const sleep = d => new Promise(r => setTimeout(r, d));

let browser;
const visit = async (url) => {
    try {
        if (browser) {
            await browser.close();
            await sleep(2000);
            console.log("Terminated ongoing job.");
        }
        browser = await puppeteer.launch({
            browser: 'chrome',
            headless: true,
            args: [
                "--disable-features=HttpsFirstBalancedModeAutoEnable",
                "--no-sandbox"
            ]
        });

        const ctx = await browser.createBrowserContext();

        page = await ctx.newPage();
        await page.goto(`http://traefik/flag`, { timeout: 3000, waitUntil: 'domcontentloaded' });
        await page.evaluate((flag) => {
            localStorage.setItem('flag', flag);
        }, FLAG);
        await sleep(500);
        await page.close();

        page = await ctx.newPage();

        await page.goto(url, { timeout: 3000, waitUntil: 'domcontentloaded' });

        await sleep(1000 * 60 * 2);

        await browser.close();
        browser = null;
    } catch (err) {
        console.log(err);
    } finally {
        console.log('close');
        if (browser) await browser.close();
    }
};



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});