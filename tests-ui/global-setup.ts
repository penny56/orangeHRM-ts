import { chromium, expect } from '@playwright/test'
import type { FullConfig } from '@playwright/test'

async function globalSetup(_config: FullConfig) {
    // 打开浏览器界面，playwright.config 的headless对 global-config 不起作用
    const browser = await chromium.launch({ headless: false })

    const adminContext = await browser.newContext()
    const adminPage = await adminContext.newPage()

    await adminPage.goto("https://opensource-demo.orangehrmlive.com/web/index.php/auth/login")
    await adminPage.getByPlaceholder('Username').fill('Admin')
    await adminPage.getByPlaceholder('Password').fill('admin123')
    await adminPage.getByRole('button', {name: 'Login'}).click()

    /* 确保admin登录成功 */
    await adminPage.getByRole('heading', { name: 'Dashboard' }).waitFor()
    await adminContext.storageState({path: './admin-state.json'})

    /* 进入PIM界面 */
    const PIMButton = adminPage.locator('div.oxd-sidepanel-body').getByRole('link', {name: 'PIM'})
    await PIMButton.click()
    await expect(adminPage.getByRole('heading', {name: 'PIM'})).toBeVisible()

    /* 点击Add */ 
    const addButton = adminPage.getByRole('button', {name: 'Add'})
    await expect(addButton).toBeVisible()
    await addButton.click()
    await expect(adminPage.getByRole('heading', {name: 'Add Employee'})).toBeVisible()

    /* 添加employee */
    const code = String(Math.floor(Math.random() * 999999) + 1)
    const firstNameField = adminPage.getByPlaceholder('First Name')
    await firstNameField.fill(code)
    const lastNameField = adminPage.getByPlaceholder('Last Name')
    await lastNameField.fill('user')
    const employeeIdField = adminPage.locator('.oxd-input-group', { hasText: 'Employee Id' }).locator('input.oxd-input')
    await employeeIdField.fill(code)

    /* 同时添加 login: create login details */
    await adminPage.locator('.oxd-switch-wrapper').locator('.oxd-switch-input').click()
    /* 等待 login 信息出现 */
    await adminPage.getByText('Username', { exact: true }).waitFor()

    const loginInfo = `user${code}`
    await adminPage.locator('.oxd-input-group', { hasText: 'Username' }).locator('input').fill(loginInfo)
    await adminPage.locator('.oxd-input-group', { hasText: 'Password' }).nth(0).locator('input').fill(loginInfo)
    await adminPage.locator('.oxd-input-group', { hasText: 'Password' }).nth(1).locator('input').fill(loginInfo)

    /* 点击 enabled */
    await adminPage.locator('.oxd-radio-wrapper', { hasText: 'Enabled' }).locator('.oxd-radio-input').click()

    /* 点击 save */
    const saveButton = adminPage.getByRole('button', {name: 'Save'})
    await saveButton.click()

    /* 验证创建用户成功 */
    // Toast 只要出现过一次就算成功
    await adminPage.waitForSelector('text=Successfully Saved', { timeout: 20000 })

    /* adminContext 完成使命 */
    await adminContext.close()

    /* user登录 */
    const userContext = await browser.newContext()
    const userPage = await userContext.newPage()
    await userPage.goto("https://opensource-demo.orangehrmlive.com/web/index.php/auth/login")

    await userPage.getByPlaceholder('Username').fill(loginInfo)
    await userPage.getByPlaceholder('Password').fill(loginInfo)
    await userPage.getByRole('button', {name: 'Login'}).click()

    await userContext.storageState({path: './user-state.json'})

    /* userContext 完成使命 */
    await userContext.close()

    await browser.close()
}

export default globalSetup