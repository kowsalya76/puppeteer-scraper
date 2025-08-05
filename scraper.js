const express = require('express');
const puppeteer = require('puppeteer-core');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_API_KEY = process.env.API_KEY || "mySuperSecretKey123"; // fallback for local

// Health check route for Render
app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

// API key authentication middleware
const apiKeyAuth = (req, res, next) => {
    const providedKey = req.header('x-api-key');
    if (!providedKey || providedKey !== SECRET_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid API key.' });
    }
    next();
};

// Root route for welcome message
app.get('/', (req, res) => {
    res.send('Welcome to the Puppeteer Scraper API! Use /scrape or /healthz endpoints.');
});

// Scrape endpoint
app.get('/scrape', apiKeyAuth, async (req, res) => {
    let { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL query parameter is required.' });

    const urlMatch = url.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) return res.status(400).json({ error: 'Invalid URL format.' });
    url = urlMatch[0];

    const urlObject = new URL(url);
    const domain = urlObject.hostname;

    const pagesToVisit = new Set([url]);
    const visitedPages = new Set();
    const allPagesData = [];
    const MAX_PAGES = 20;

   let browser;
try {
    browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: '/usr/bin/google-chrome'  // 🔧 Updated for puppeteer-core
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0');

    while (pagesToVisit.size > 0 && visitedPages.size < MAX_PAGES) {
        const currentUrl = pagesToVisit.values().next().value;
        pagesToVisit.delete(currentUrl);

        if (visitedPages.has(currentUrl)) continue;
        visitedPages.add(currentUrl);

        try {
            await page.goto(currentUrl, { waitUntil: 'networkidle2', timeout: 60000 });
            const content = await page.content();
            allPagesData.push({ url: currentUrl, html: content });

            const links = await page.$$eval('a', as => as.map(a => a.href));
            links.forEach(link => {
                try {
                    const linkObj = new URL(link, url);
                    if (linkObj.hostname === domain && !visitedPages.has(linkObj.href)) {
                        pagesToVisit.add(linkObj.href);
                    }
                } catch { }
            });
        } catch (err) {
            allPagesData.push({ url: currentUrl, html: `Error: ${err.message}` });
        }
    }

    res.status(200).json(allPagesData);
} catch (error) {
    res.status(500).json({ error: 'Failed to crawl.', details: error.message });
} finally {
    if (browser) await browser.close();
}

app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
});

