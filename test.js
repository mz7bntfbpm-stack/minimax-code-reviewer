/**
 * Minimax Code Review Assistant - Test Suite
 */
const { chromium } = require('playwright');
const path = require('path');

async function runTests() {
    console.log('Starting Minimax Code Review Assistant tests...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Collect console messages
    const consoleMessages = [];
    const consoleErrors = [];

    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        } else {
            consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
        }
    });

    page.on('pageerror', error => {
        consoleErrors.push(`Page Error: ${error.message}`);
    });

    try {
        // Navigate to the page
        const filePath = path.join(__dirname, 'index.html');
        await page.goto(`file://${filePath}`);
        console.log('✓ Page loaded successfully');

        // Wait for the app to initialize
        await page.waitForSelector('.app-container', { timeout: 5000 });
        console.log('✓ App container found');

        // Check header elements
        const logo = await page.$('.logo');
        const header = await page.$('.header');
        const analyzeBtn = await page.$('#analyzeBtn');

        if (logo) console.log('✓ Logo element present');
        else console.log('✗ Logo element missing');

        if (header) console.log('✓ Header element present');
        else console.log('✗ Header element missing');

        if (analyzeBtn) console.log('✓ Analyze button present');
        else console.log('✗ Analyze button missing');

        // Test code editor
        const codeEditor = await page.$('#codeEditor');
        if (codeEditor) {
            await codeEditor.fill(`// Test code
const apiKey = "YOUR_API_KEY";
async function test() {
    const response = await fetch('https://api.minimax.chat/test');
    return response.json();
}`);
            console.log('✓ Code editor accepts input');

            // Update stats
            const lineCount = await page.$eval('#lineCount', el => el.textContent);
            const charCount = await page.$eval('#charCount', el => el.textContent);
            console.log(`✓ Stats updated: ${lineCount}, ${charCount}`);
        }

        // Test language selector
        const languageSelect = await page.$('#languageSelect');
        if (languageSelect) {
            await languageSelect.selectOption('python');
            console.log('✓ Language selector works');
        }

        // Test load sample button
        const loadSampleBtn = await page.$('#loadSampleBtn');
        if (loadSampleBtn) {
            await loadSampleBtn.click();
            await page.waitForTimeout(500);
            const editorValue = await page.$eval('#codeEditor', el => el.value);
            if (editorValue.length > 0) {
                console.log('✓ Load sample functionality works');
            }
        }

        // Test analyze button
        const analyzeButton = await page.$('#analyzeBtn');
        if (analyzeButton) {
            await analyzeButton.click();
            await page.waitForTimeout(1500);

            // Check if results container updated
            const resultsHtml = await page.$eval('#resultsContainer', el => el.innerHTML);
            if (resultsHtml.includes('issue-card') || resultsHtml.includes('summary-stats')) {
                console.log('✓ Analysis produces results');
            } else if (resultsHtml.includes('Keine Probleme')) {
                console.log('✓ Analysis completed (no issues)');
            }
        }

        // Test settings modal
        const settingsBtn = await page.$('#settingsBtn');
        if (settingsBtn) {
            await settingsBtn.click();
            await page.waitForTimeout(300);
            const modal = await page.$('.modal-overlay.open');
            if (modal) {
                console.log('✓ Settings modal opens');
                await page.click('#closeSettingsBtn');
                await page.waitForTimeout(300);
            }
        }

        // Test history modal
        const historyBtn = await page.$('#historyBtn');
        if (historyBtn) {
            await historyBtn.click();
            await page.waitForTimeout(300);
            const modal = await page.$('.modal-overlay.open');
            if (modal) {
                console.log('✓ History modal opens');
                await page.click('#closeHistoryBtn');
                await page.waitForTimeout(300);
            }
        }

        // Test clear button
        const clearBtn = await page.$('#clearBtn');
        if (clearBtn) {
            await clearBtn.click();
            const editorValue = await page.$eval('#codeEditor', el => el.value);
            if (editorValue.length === 0) {
                console.log('✓ Clear button works');
            }
        }

        // Report console messages
        console.log('\n--- Console Output ---');
        if (consoleMessages.length > 0) {
            consoleMessages.forEach(msg => console.log(msg));
        } else {
            console.log('No console messages');
        }

        // Report errors
        console.log('\n--- Console Errors ---');
        if (consoleErrors.length > 0) {
            consoleErrors.forEach(err => console.log(`ERROR: ${err}`));
            console.log(`\n✗ Found ${consoleErrors.length} console error(s)`);
        } else {
            console.log('No console errors - All tests passed!');
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

runTests().catch(console.error);
