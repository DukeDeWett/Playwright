import { test, expect, Page } from '@playwright/test';
import { LoginPage } from './login.page.ts';
import { AdminPage } from './admin.page.ts';
import { PIMPage } from './pim.page.ts';

test.describe('OrangeHRM Tests', () => {
    let page: Page;
    let loginPage: LoginPage;
    let adminPage: AdminPage;
    let pimPage: PIMPage;

    test.beforeEach(async ({ page: p }) => {
      const loginData = {
        panelLogin: 'Admin',
        panelPassword: 'admin123'
      };

        page = p;
        loginPage = new LoginPage(page);

        await loginPage.navigate();
        await loginPage.login(loginData.panelLogin, loginData.panelPassword);
        await loginPage.verifyLoginSuccessful();
    });

    test('Admin: Create, Edit, and Delete Admin User', async () => {
        const adminData = {
          username: 'TestAdminUser',
          password: 'password123',
          newPassword: 'newPassword123',
        };

        adminPage = new AdminPage(page);
        await adminPage.navigate(); // Navigate to Admin page within the test
        await adminPage.clickAdd();
        await adminPage.fillAdminDetails('', adminData.username, adminData.password, adminData.password);
        await adminPage.saveAdmin();


        await adminPage.editAdmin(adminData.username, adminData.newPassword, adminData.newPassword);

        await adminPage.deleteAdmin(adminData.username);
    });

    test('PIM: Create, Edit, and Delete Employee', async () => {
        const employeeData = {
            firstName: 'Joee',
            middleName: 'George',
            newMiddleName: 'Marcus',
            lastName: 'Doe',
            username: 'TestPIMUser',
            password: 'password123',
      };

        pimPage = new PIMPage(page);
        await pimPage.navigate();
        await pimPage.clickAdd();
        await pimPage.fillEmployeeDetails(employeeData.firstName, employeeData.middleName, employeeData.lastName, '', employeeData.username, employeeData.password, employeeData.password);
        await pimPage.saveEmployee();
      
        // Verify employee creation (including details on the personal details page)
        await pimPage.verifyEmployeeCreated(employeeData.firstName, employeeData.middleName, employeeData.lastName);
      
        // Edit the employee's middle name
        await pimPage.editEmployee(employeeData.newMiddleName);
      
        // Verify that the middle name is updated
        await pimPage.verifyEmployeeCreated(employeeData.firstName, employeeData.newMiddleName, employeeData.lastName); // Verify with the new middle name
      
        // Delete the employee
        await pimPage.deleteEmployee(employeeData.firstName, employeeData.newMiddleName, employeeData.lastName);
      });
});