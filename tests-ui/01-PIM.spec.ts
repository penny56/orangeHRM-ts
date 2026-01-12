import {test, expect } from '@playwright/test'

test.beforeEach(async ({ page }, testInfo) => {
    console.log('>>> Str to -------> ', testInfo.title)

    await page.goto("https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList", { waitUntil: "domcontentloaded" })
    await page.waitForSelector('div.oxd-table-filter', { state: 'visible' })
});

test.afterEach(async ({ page }, testInfo) => {
    console.log('=== End of =======> ', testInfo.title)
});

test.describe('With session', () => {

    test.use({ storageState: './admin-state.json'})

    test('1.1 create employees', async ({ page }) => {
        /* 创建员工 (Happy Path) - 填写必填项，上传头像（setInputFiles），验证保存成功。 */

        /* 点击Add */ 
        const addButton = page.getByRole('button', {name: 'Add'})
        await expect(addButton).toBeVisible()
        await addButton.click()
        await expect(page.getByRole('heading', {name: 'Add Employee'})).toBeVisible()

        /* 添加员工信息 */
        const code = String(Math.floor(Math.random() * 999999) + 1)
        const firstNameField = page.getByPlaceholder('First Name')
        await firstNameField.fill(code)
        const lastNameField = page.getByPlaceholder('Last Name')
        await lastNameField.fill('user')

        /* 添加头像 */
        const imageButton = page.locator('button.employee-image-action')
        await imageButton.click()

        // 在“隐藏的”input 上上传头像
        await page.locator('input[type="file"]').setInputFiles('./cat.png')


        /* 同时点击 create login details */
        await page.locator('.oxd-switch-wrapper').locator('.oxd-switch-input').click()
        /* 等待 login 信息出现 */
        await page.getByText('Username', { exact: true }).waitFor()

        const userName = `user${code}`
        await page.locator('.oxd-input-group', { hasText: 'Username' }).locator('input').fill(userName)
        await page.locator('.oxd-input-group', { hasText: 'Password' }).nth(0).locator('input').fill(userName)
        await page.locator('.oxd-input-group', { hasText: 'Password' }).nth(1).locator('input').fill(userName)

        /* 点击 enabled */
        await page.locator('.oxd-radio-wrapper', { hasText: 'Enabled' }).locator('.oxd-radio-input').click()

        console.log(`create user: ${userName}`)

        const saveButton = page.getByRole('button', {name: 'Save'})
        await saveButton.click()

        /* 验证创建用户成功 */
        const frameWork = page.locator('div.orangehrm-edit-employee-content')
        await frameWork.waitFor({ state: 'visible' })

        const nameBadge = page.locator('div.orangehrm-edit-employee-name')
        await expect(nameBadge).toContainText(`${code} user`)
    });
});