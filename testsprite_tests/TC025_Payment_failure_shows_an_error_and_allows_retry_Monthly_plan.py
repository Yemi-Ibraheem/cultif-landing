import asyncio
from playwright import async_api
from playwright.async_api import expect

from _config import TEST_EMAIL, TEST_PASSWORD

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:5173
        await page.goto("http://localhost:5173", wait_until="commit", timeout=10000)
        
        # -> Navigate to /auth (use exact path appended to base URL)
        await page.goto("http://localhost:5173/auth", wait_until="commit", timeout=10000)
        
        # -> Type the email and password into the respective fields and click the 'Sign In' button to attempt login.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill(TEST_EMAIL)
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill(TEST_PASSWORD)
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Click on a recipe card in the Discover feed (choose the 'Jerk chicken and sweetcorn' recipe image).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div/section/div[2]/div[2]/img').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Click the 'Monthly' plan option on the recipe/subscription UI.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/nav/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Click the 'Subscribe' button to attempt the subscription and trigger the checkout flow (then verify the 'Payment failed' message). Immediate action: click the Subscribe button.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/nav/button[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Find and click the visible 'Subscribe' button (retry click using a fresh element index), wait for the checkout to process, then look for the 'Payment failed' message to verify the error is shown.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/nav/button[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        assert '/discover' in frame.url
        await expect(frame.locator('text=Payment failed').first).to_be_visible(timeout=3000)
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    