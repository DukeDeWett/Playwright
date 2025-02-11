import { Page, expect } from '@playwright/test';

export class PIMPage {
  constructor(public page: Page) {}

  async navigate() {
    await this.page.getByRole('link', { name: 'PIM' }).click();
    await expect(this.page).toHaveURL(/pim\/viewEmployeeList/); // Assert navigation
  }

  async clickAdd() {
    await this.page.getByRole('button', { name: ' Add' }).click();
  }

  async fillEmployeeDetails(firstName: string, middleName: string, lastName: string, employeeId?: string, username?: string, password?: string, confirmPassword?: string) {
    await this.page.getByRole('textbox', { name: 'First Name' }).fill(firstName);
    await this.page.getByRole('textbox', { name: 'Middle Name' }).fill(middleName); // Provide default empty string
    await this.page.getByRole('textbox', { name: 'Last Name' }).fill(lastName);
    const employeeIdField = this.page.locator('form').getByRole('textbox').nth(4)
    await expect(employeeIdField).not.toBeEmpty();

    // Click the switch to reveal additional fields
    await this.page.locator('form span').click();

    await this.page.locator('div:nth-child(4) >.oxd-grid-2 > div >.oxd-input-group > div:nth-child(2) >.oxd-input').waitFor({ state: 'visible' });

    // Fill username
    await this.page.locator('div:nth-child(4) >.oxd-grid-2 > div >.oxd-input-group > div:nth-child(2) >.oxd-input').fill(username || '');

    // Fill password fields
    await this.page.locator('input[type="password"]').first().fill(password || '');
    await this.page.locator('input[type="password"]').nth(1).fill(confirmPassword || ''); // Fill confirm password field
    }

    async saveEmployee() {
      await this.page.getByRole('button', { name: 'Save' }).click();
    }

    async verifyEmployeeCreated(firstName: string, middleName: string, lastName: string) {
      // Wait for the "Personal Details" heading to appear
      await this.page.getByRole('heading', { name: 'Personal Details' }).waitFor({ state: 'visible' });

      // Verify that the first, middle, and last names match the provided values
      await expect(this.page.getByRole('textbox', { name: 'First Name' })).toHaveValue(firstName);
      await expect(this.page.getByRole('textbox', { name: 'Middle Name' })).toHaveValue(middleName || ''); // Handle optional middle name
      await expect(this.page.getByRole('textbox', { name: 'Last Name' })).toHaveValue(lastName);
  }

  async editEmployee(newMiddleName: string) {

    // Change the middle name
    await this.page.getByRole('textbox', { name: 'Middle Name' }).fill(newMiddleName);

    // Save the changes
    await this.page.locator('form').filter({ hasText: 'Employee Full NameEmployee' }).getByRole('button').click();

    // Verify that the middle name is updated
    await expect(this.page.getByRole('textbox', { name: 'Middle Name' })).toHaveValue(newMiddleName);
}

  async deleteEmployee(firstName: string, middleName: string, lastName: string) {
    // Fill the search field with the full name
    await this.page.getByRole('link', { name: 'PIM' }).click();
    const searchField = this.page.getByRole('textbox', { name: 'Type for hints...' }).first();
    await searchField.waitFor({ state: 'visible' });
    await searchField.fill(`${firstName} ${middleName} ${lastName}`);
    
    // Wait for suggestions to appear (if applicable) and select the first one
    // (You might need to adjust this based on how the suggestions work)
    await this.page.waitForSelector('.oxd-autocomplete-dropdown', { timeout: 5000 }); // Adjust timeout if needed
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');

    // Click the search button
    await this.page.getByRole('button', { name: 'Search' }).click();

    // Locate the employee row using the provided pattern (adjust if needed)
    const employeeRow = this.page.getByRole('row', { name: new RegExp(`${firstName} ${middleName} ${lastName}`, 'i') }); // Case-insensitive search
    await expect(employeeRow).toBeVisible();

    // Click the delete button in the row
    await employeeRow.getByRole('button', { name: '' }).click();

    // Confirm deletion
    await this.page.getByRole('button', { name: ' Yes, Delete' }).click();
  }
}