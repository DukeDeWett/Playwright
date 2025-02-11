import { Page } from '@playwright/test';

export class LoginPage {
  constructor(public page: Page) {}

  async navigate() {
    await this.page.goto('https://opensource-demo.orangehrmlive.com');
  }

  async login(username: string, password: string) {
    // More robust locators:
    await this.page.locator('input[name="username"]').fill(username); // Using attribute selector
    await this.page.locator('input[name="password"]').fill(password); // Using attribute selector
    await this.page.locator('button.orangehrm-login-button').click(); // Using class selector
  }

  async verifyLoginSuccessful() {
    await this.page.waitForURL(/dashboard/);
  }
}