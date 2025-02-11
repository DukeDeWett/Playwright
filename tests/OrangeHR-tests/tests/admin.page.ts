import { Page, expect } from '@playwright/test';

export class AdminPage {
  constructor(public page: Page) {}

  async navigate() {
    await this.page.getByRole('link', { name: 'Admin' }).click();
    await expect(this.page).toHaveURL(/admin\/viewSystemUsers/); // Updated URL pattern
  }

  async clickAdd() {
    await this.page.getByRole('button', { name: ' Add' }).click();
  }

  async fillAdminDetails(employeeName: string, username: string, password: string, confirmPassword: string, role: string = "Admin", status: string = "Enabled") {

    // Handle Employee Name (auto-suggestions):
    const employeeNameInput = this.page.getByRole('textbox', { name: 'Type for hints...' });

    await employeeNameInput.click(); // Click the input field first
    await employeeNameInput.fill("a"); // Type "a"

    await this.page.waitForTimeout(1500); // Wait for 1.5 seconds

    await this.page.keyboard.press('ArrowDown'); // Navigate to the first suggestion
    await this.page.keyboard.press('Enter'); // Select the suggestion

    // Select Role:
    await this.page.locator('.oxd-select-text').first().click();
    await this.page.getByRole('option', { name: role }).click(); // More robust selection

    // Select Status:
    await this.page.locator('div:nth-child(3) >.oxd-input-group > div:nth-child(2) >.oxd-select-wrapper >.oxd-select-text').click();
    await this.page.getByRole('option', { name: status }).click(); // More robust selection

    // Fill other fields:
    await this.page.getByRole('textbox').nth(2).fill(username);
    await this.page.getByRole('textbox').nth(3).fill(password);
    await this.page.getByRole('textbox').nth(4).fill(confirmPassword);
  }


  async saveAdmin() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async editAdmin(username: string, newPassword?: string, newConfirmPassword?: string) {
    // Locate the row using a partial match on the username (more robust):
    const rowLocator = this.page.getByRole('row', { name: new RegExp(username, 'i') }); // 'i' for case-insensitive

    // Click the edit button in that row:
    await rowLocator.getByRole('button').nth(1).click();

    // Handle password change (if new password is provided):
    if (newPassword && newConfirmPassword) {
      await this.page.locator('label').filter({ hasText: 'Yes' }).locator('i').click(); // Check the "Change Password" checkbox

      // Reuse password input locators (good practice!):
      const passwordInput = this.page.getByRole('textbox').nth(3);
      const confirmPasswordInput = this.page.getByRole('textbox').nth(4);

      await passwordInput.fill(newPassword);
      await confirmPasswordInput.fill(newConfirmPassword);
    }

    // Click the save button:
    await this.page.getByRole('button', { name: 'Save' }).click();

    // Verification (alternative to success message):
    // 1. Check for URL change (less reliable but can be used):
    // await this.page.waitForURL(/admin\/viewSystemUsers/);

    // 2. Check if the user details are updated in the table (better):
    await rowLocator.waitFor({state: 'visible'}); // Wait for the row to be visible
    await expect(rowLocator).toContainText(username); // Row should still contain the username

    // 3. Check if the updated user details are present on the user details screen (best):
    // (This would require navigating to the user details screen, which we can add later)
  }

  async deleteAdmin(username: string) {
    const rowLocator = this.page.getByRole('row', { name: new RegExp(username, 'i') });

    // Click the delete button:
    await rowLocator.getByRole('button').first().click();

    // Confirm deletion:
    await this.page.getByRole('button', { name: ' Yes, Delete' }).click();

    // Verification: Check if the row is no longer present (most reliable):
    await expect(rowLocator).not.toBeVisible(); // or await expect(rowLocator).toHaveCount(0);

    // Alternative Verification: Check for success message (less reliable):
    // await expect(this.page.getByText('SuccessSuccessfully Deleted')).toBeVisible();

    // OR even better approach would be to check the table if the user is not present there
    await this.page.waitForTimeout(1000) // we can wait a little bit, so table can be rerendered
    await expect(this.page.getByRole('row', { name: new RegExp(username, 'i') })).not.toBeVisible();
  }
};