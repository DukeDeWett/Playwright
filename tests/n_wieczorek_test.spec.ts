import { test, expect } from '@playwright/test';

// Zwiększenie Timeout'u, ponieważ czas pełnego logowania jest zależny od obciążenia serwera i aplikacji.
test.setTimeout(60000); // Zmiana do 60 sekund.

// Dane testowe
const loginUrl = 'https://testyautomatyczne.telemedi.com/pl/login'; // Strona logowania
const mainUrl = 'https://testyautomatyczne.telemedi.com/pl' // Strona główna
const username = 'testy.automatyczne+rekrutacjaqa@telemedi.com'; // Nazwa użytkownika
const password = 'meUT*2zqg!aHEznUhiC_'; // Hasło
const medicationName = 'Afastural'; // Nazwa leku
const packageSize = '1 sasz. 8 g'; // Wielkość opakowania

test('Automatyczne umawianie konsultacji z receptą', async ({ page }) => {
    // Przejście na stronę logowania
    // Logowanie przy użyciu danych testowych
    await test.step('Logowanie do aplikacji', async () => {
        await page.goto(loginUrl);
        await page.fill('input[id="username"]', username);
        await page.fill('input[id="password"]', password);
        await page.click('button[type="submit"]'); // Kliknięcie przycisku "Zaloguj się"
    });

    
    await test.step('Przejście do sekcji Umów się -> Recepta', async () => {
        await page.waitForURL(mainUrl, { timeout: 15000 }); // Oczekiwanie na przekierowanie po zalogowaniu
        // Przejście do sekcji 'Umów się' -> 'Recepta'
        await page.click('text=Umów się');
        await page.click('text=Recepta');
    });

    await test.step('Wyszukanie i wybranie leku', async () => {
        // Wyszukanie i wybranie leku 'Afastural'
        await page.click('.select-v2__searchbox input'); // Click to focus
        await page.fill('.select-v2__searchbox input', medicationName); // Wpisanie nazwy leku w pole do wyszukiwania produktów
        // Wprowadzenie waitu, by upewnić się, że wyszukiwarka zwróci wyszukiwane pozycje
        await page.waitForTimeout(2000); // 2 sekundy to czas, w którym animacja pokazywania się leku powinna się już zakończyć
        await page.keyboard.press('Enter'); // Wybranie pozycji przyciskiem Enter było w tym wypadku bardzo skuteczne
    });

    await test.step('Wybór odpowiedniego opakowania', async() => {
        // Wybranie odpowiedniego opakowania
        await page.waitForTimeout(1000); // Wait pomaga nam tutaj, ponieważ animacja wybrania produktu zajmuję chwilę i w ten sposób test jest stabilniejszy
        // Krok 1: Znalezienie dropdownu i kliknięcie w niego
        const dropdown = page.locator('.select-react');
        await dropdown.click();
        // Krok 2: Upewnienie się, że wśród opcji z dropdown'u jest ta opcja, której szukamy
        const optionList = page.locator('.fk-select-v2__option');
        await optionList.first().waitFor({ state: 'visible' });
        // Krok 3: Wybranie opcji opakowania na podstawie parametru packageSize
        const option = page.locator('.fk-select-v2__option', { hasText: packageSize });
        await option.waitFor({ state: 'visible' });
        await option.click();
        // Krok 4: Upewnienie się, że wybrana opcja jest dokładnie tą, którą chcieliśmy wybrać
        await expect(page.locator('.css-1uccc91-singleValue')).toHaveText(packageSize);
    });

    await test.step('Akceptacja zgody na temat recepty', async () => {
        // Kliknięcie w zgodę na temat recepty
        const checkboxLabel = page.locator('label').filter({ hasText: 'Akceptuję, że to lekarz' });
        // Upewnienie się, że checkbox od zgody jest widoczny, dzięki czemu testy są bardziej stabilne
        await checkboxLabel.waitFor({ state: 'visible' });
        // Kliknięcie w checkboox od zgody
        await checkboxLabel.click();
    });

    await test.step('Kliknięcie przycisku Wybierz', async () => {
        // Kliknięcie przycisku 'Wybierz'
        const wybierzButton = page.locator('button.fk-button', { hasText: 'Wybierz' }); // Interakcja z przyciskiem w ten sposób skutkuje większą stabilnością testów
        await wybierzButton.click();
    });

    await test.step('Akceptacja wszystkich zgód związanych z zamówieniem', async() => {
        // Zaakceptowanie zgód przy użyciu checkboxa "Zaznacz wszystkie"
        const acceptAllLabel = page.locator('label').filter({ hasText: 'Zaznacz wszystkie' });
        await acceptAllLabel.click(); // Kliknięcie w label powoduje kliknięcie w checkbox, który w innym wypadku jest niestabilny
    });

    await test.step('Sfinalizowanie zamówienia', async () => {
        // Wybranie wizyty za 59.00 PLN
        const bookButton = page.getByRole('button', { name: 'Umów za 59.00 PLN' }); // Znalezienie przycisku wizyty za 59.90
        await bookButton.waitFor({ state: 'visible' }); // Upewnienie się, że przycisk jest widoczny przed interakcją z nim.
        await bookButton.click(); // Kliknięcie w przycisk, który powoduje przekierowanie na stronę PayU
    });

    await test.step('Weryfikacja czy przekierowanie na stronę PayU się powiodło', async () => {
        // Wait for navigation to start and complete
        await Promise.all([
            // This will wait for the next navigation to complete
            page.waitForURL(/secure\.payu\.com/, { timeout: 40000 }),
            // Trigger the action that causes navigation (if needed)
            // page.click('#submit-button') // Uncomment and modify if needed
        ]);
    
        // Additional verification if needed
        const currentUrl = page.url();
        await expect(page).toHaveURL(/secure\.payu\.com/);
    });
});