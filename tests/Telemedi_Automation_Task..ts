import { test, expect } from '@playwright/test';

// Increasing the timeout to 60 seconds, as the application is supposed to finish whole process in one minute.
test.setTimeout(60000);

// Dane testowe
const loginUrl = 'https://testyautomatyczne.telemedi.com/pl/login'; // Login URL
const mainUrl = 'https://testyautomatyczne.telemedi.com/pl' // Main page
const username = 'testy.automatyczne+rekrutacjaqa@telemedi.com'; // Username
const password = 'meUT*2zqg!aHEznUhiC_'; // Password
const medicationName = 'Afastural'; // Name of the medicine
const packageSize = '1 sasz. 8 g'; // Package size

test('Automatyczne umawianie konsultacji z receptą', async ({ page }) => {
    // Opening login webpage
    // Logging in using the credentials
    await test.step('Logowanie do aplikacji', async () => {
        await page.goto(loginUrl);
        await page.fill('input[id="username"]', username);
        await page.fill('input[id="password"]', password);
        await page.click('button[type="submit"]'); // Click on the "log in" button
    });

    
    await test.step('Przejście do sekcji Umów się -> Recepta', async () => {
        await page.waitForURL(mainUrl, { timeout: 15000 }); // Waiting for the page to load after redirecting
        // Going to section: 'Umów się' -> 'Recepta'
        await page.click('text=Umów się');
        await page.click('text=Recepta');
    });

    await test.step('Wyszukanie i wybranie leku', async () => {
        // Searching for medicine 'Afastural'
        await page.click('.select-v2__searchbox input'); // Click to focus
        await page.fill('.select-v2__searchbox input', medicationName); //Entering the medicine name in the search field
        // Wait here is necessary for the searchbox to return some data
        await page.waitForTimeout(2000); // 2 seconds worked best
        await page.keyboard.press('Enter'); // Using "Enter" key worked best
    });

    await test.step('Wybór odpowiedniego opakowania', async() => {
        // Choosing the adequate package size.
        await page.waitForTimeout(1000); // This wait made testing more stable, as the loading animation took a long time.
        // First step: finding the dropdown menu and clicking it.
        const dropdown = page.locator('.select-react');
        await dropdown.click();
        // Second step: Making sure that the package size we need is available.
        const optionList = page.locator('.fk-select-v2__option');
        await optionList.first().waitFor({ state: 'visible' });
        // Third step: Choosing the package size based on our data.
        const option = page.locator('.fk-select-v2__option', { hasText: packageSize });
        await option.waitFor({ state: 'visible' });
        await option.click();
        // Fourth step: Making sure that the option that we were supposed to choose was chosen properly.
        await expect(page.locator('.css-1uccc91-singleValue')).toHaveText(packageSize);
    });

    await test.step('Akceptacja zgody na temat recepty', async () => {
        // Accepting the information about medical prescriptions.
        const checkboxLabel = page.locator('label').filter({ hasText: 'Akceptuję, że to lekarz' });
        // Making sure that the checkbox is visibile, before we try to click it.
        await checkboxLabel.waitFor({ state: 'visible' });
        // Clicking that checkbox.
        await checkboxLabel.click();
    });

    await test.step('Kliknięcie przycisku Wybierz', async () => {
        // Clicking the 'Wybierz' button
        const wybierzButton = page.locator('button.fk-button', { hasText: 'Wybierz' }); // Tests were more stable this way.
        await wybierzButton.click();
    });

    await test.step('Akceptacja wszystkich zgód związanych z zamówieniem', async() => {
        // Accepting the checkbox: "Zaznacz wszystkie"
        const acceptAllLabel = page.locator('label').filter({ hasText: 'Zaznacz wszystkie' });
        await acceptAllLabel.click(); // Clicking the label works more steady than interracting with the checkbox itself.
    });

    await test.step('Sfinalizowanie zamówienia', async () => {
        // Choosing the appointment for 59.00 PLN.
        const bookButton = page.getByRole('button', { name: 'Umów za 59.00 PLN' }); // Finding the button that has an appointment for 59.90 PLN
        await bookButton.waitFor({ state: 'visible' }); // Making sure that the button is visible, before we interract with it.
        await bookButton.click(); // Clicking the submit button that will redirect us to the PayU website.
    });

    await test.step('Weryfikacja czy przekierowanie na stronę PayU się powiodło', async () => {
        // Wait for navigation to start and complete
        await Promise.all([
            // This will wait for the next navigation to complete
            page.waitForURL(/secure\.payu\.com/, { timeout: 40000 })
        ]);
    
        // Additional verification if needed
        const currentUrl = page.url();
        await expect(page).toHaveURL(/secure\.payu\.com/);
    });
});