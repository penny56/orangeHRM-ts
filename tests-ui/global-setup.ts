import { chromium, expect } from '@playwright/test'
import type { FullConfig } from '@playwright/test'

async function globalSetup(_config: FullConfig) {
    const browser = await chromium.launch()
    
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
    await adminPage.pause()
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

    /* 同时添加user: create login details */
    await adminPage.locator('.oxd-switch-wrapper').locator('.oxd-switch-input').click()

    // 这里有点特殊，如果没有合适的locator，可以使用普遍存在的'.oxd-input-group'
    // 这里，可以使用 { hasText: 'Username' } 来定位
    // 之后，找到这个父 element 中的可以输入的 <input>
    const userName = `user${code}`
    // set username
    await adminPage.locator('.oxd-input-group', { hasText: 'Username' }).locator('input').fill(userName)
    // set password
    await adminPage.locator('.oxd-input-group', { hasText: 'Password' }).nth(0).locator('input').fill(userName)
    // confirm password
    await adminPage.locator('.oxd-input-group', { hasText: 'Password' }).nth(1).locator('input').fill(userName)

    /* 点击 enabled */
    // ChatGPT 说这里需要点击 <span> 而不是 <input>，因为：span 在 input 的“上层”，我不理解。
    // 浏览器点击到谁的规则：把click 派发给 “最上层的可接收 pointer-events 的元素”，不会穿透到下面的元素，
    // 这里的 css 是：
    /* DOM 里的“前后顺序”≠ 页面上的“上下层级”，谁在上面，取决于 CSS，不取决于 HTML 写在前还是后
    <div data-v-7ef819fd="" class="oxd-radio-wrapper">
        <label data-v-7ef819fd="" class=""><!---->
            <input data-v-7ef819fd="" type="radio" value="1">
            <span data-v-7ef819fd="" class="oxd-radio-input oxd-radio-input--active --label-right oxd-radio-input"></span>
        Enabled</label>
    </div>
    ┌──────── label ────────┐
    │  [ span ]  Enabled    │  ← 鼠标点这里()
    │   ↑                    │
    │ input (透明 / 0尺寸)   │
    └───────────────────────┘
    */
    // await adminPage.locator('.oxd-radio-wrapper', { hasText: 'Enabled' }).locator('input').check()
    await adminPage.locator('.oxd-radio-wrapper', { hasText: 'Enabled' }).locator('.oxd-radio-input').click()

    console.log(`create user: ${userName}`)

    const saveButton = adminPage.getByRole('button', {name: 'Save'})
    await saveButton.click()

    /* 验证创建用户成功 */
    // 因为要页面跳转，所以这里要加一个 waitFor()，因为即使expect()那几秒时间也太短了
    const frameWork = adminPage.locator('div.orangehrm-edit-employee-content')
    await frameWork.waitFor({ state: 'visible', timeout: 10000 })
    await expect(adminPage.getByRole('heading', {name: 'Personal Details'})).toBeVisible()

    const nameBadge = adminPage.locator('div.orangehrm-edit-employee-name')
    await expect(nameBadge).toContainText(`${code} user`)

    /* adminContext 完成使命 */
    await adminContext.close()

    /* user登录 */
    const userContext = await browser.newContext()
    const userPage = await userContext.newPage()
    await userPage.goto("https://opensource-demo.orangehrmlive.com/web/index.php/auth/login")

    await userPage.getByPlaceholder('Username').fill(userName)
    await userPage.getByPlaceholder('Password').fill(userName)
    await userPage.getByRole('button', {name: 'Login'}).click()

    await userContext.storageState({path: './user-state.json'})

    /* userContext 完成使命 */
    await userContext.close()

    await browser.close()
}

export default globalSetup