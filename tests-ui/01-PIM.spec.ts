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
        // await expect(page.locator('div.orangehrm-edit-employee-content')).toBeVisible({ timeout: 20000 })
        // 1. 明确等 URL（你已经知道会跳到这里）
        await page.waitForURL(/\/pim\/viewPersonalDetails\/empNumber\/\d+/, { timeout: 20000 })
        // 2. 明确告诉 Playwright：我不等 navigation 了
        await page.waitForLoadState('domcontentloaded')
        // 3. 再检查你说的“一定存在的框架”
        const nameBadge = page.locator('div.orangehrm-edit-employee-name')
        await expect(nameBadge).toBeVisible({ timeout: 20000 })
        await expect(nameBadge).toContainText(`${code} user`)
    });

    test('1.2 search employees', async ({ page }) => {
        test.setTimeout(60000)
        /* Case 2: 员工列表多重搜索 - 同时根据“员工姓名”、“员工ID”【和“雇佣状态”】【还没做】进行筛选。 */

        /* 先完成 add employee */
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

        const employeeIdField = page.locator('.oxd-input-group', { hasText: 'Employee Id' }).locator('input.oxd-input')
        await employeeIdField.fill(code)

        /* 记录员工信息 */
        const employeeFirstName = code
        const employeeLastName = 'user'
        const employeeId = code

        /* 添加头像 */
        const imageButton = page.locator('button.employee-image-action')
        await imageButton.click()

        // 在“隐藏的”input 上上传头像
        await page.locator('input[type="file"]').setInputFiles('./cat.png')

        /* 点击 create login details */
        await page.locator('.oxd-switch-wrapper').locator('.oxd-switch-input').click()
        /* 等待 login 信息出现 */
        await page.getByText('Username', { exact: true }).waitFor()

        const loginName = `${employeeLastName}${employeeFirstName}`
        await page.locator('.oxd-input-group', { hasText: 'Username' }).locator('input').fill(loginName)
        await page.locator('.oxd-input-group', { hasText: 'Password' }).nth(0).locator('input').fill(loginName)
        await page.locator('.oxd-input-group', { hasText: 'Password' }).nth(1).locator('input').fill(loginName)

        /* 点击 enabled */
        await page.locator('.oxd-radio-wrapper', { hasText: 'Enabled' }).locator('.oxd-radio-input').click()

        console.log(`add employee: login name = ${loginName}, employee Id = ${employeeId}`)

        const saveButton = page.getByRole('button', {name: 'Save'})
        await saveButton.click()

        /* 验证创建用户成功 */
        // await expect(page.locator('div.orangehrm-edit-employee-content')).toBeVisible({ timeout: 20000 })
        // 1. 明确等 URL（你已经知道会跳到这里）
        await page.waitForURL(/\/pim\/viewPersonalDetails\/empNumber\/\d+/, { timeout: 20000 })
        // 2. 明确告诉 Playwright：我不等 navigation 了
        await page.waitForLoadState('domcontentloaded')
        // 3. 再检查你说的“一定存在的框架”
        const nameBadge = page.locator('div.orangehrm-edit-employee-name')
        await expect(nameBadge).toBeVisible({ timeout: 20000 })
        await expect(nameBadge).toContainText(`${employeeFirstName} ${employeeLastName}`)

        /* 回到 employee list */
        await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList')

        /* 1. 根据员工姓名搜索 */
        const employeeName = `${employeeFirstName} ${employeeLastName}`
        console.log(`employee name: ${employeeName}`)
        const employeeNameInput = page.locator('.oxd-input-group', { hasText: 'Employee Name' }).locator('input[placeholder="Type for hints..."]')
        await employeeNameInput.fill(employeeName)

        // 因为是 autocomplete-text ，等待联想出现
        const option = page.getByRole('option', { name: employeeName })
        await option.waitFor()
        await option.click()

        const searchButton = page.getByRole('button', {name: 'Search'})
        await searchButton.click()

        /* 检查结果table，应该只有一条记录 */
        // 这里，因为在点击 Search 之后，record table 会需要时间来更新，所以不能先设定 rowNumber
        // 而是先设定 rows ，再通过 toHaveCount() 这个方法，这个方法会不断轮询record数量，直到expect() 的值
        // const rowNumber = await page.locator('.oxd-table-body').locator('.oxd-table-row').count()
        // expect(rowNumber).toEqual(1)
        const nameRows = page.locator('.oxd-table-body').locator('.oxd-table-row')
        await expect(nameRows).toHaveCount(1)


        //检查这一条记录应该的 first name 与 last name 都应该 match 
        let record = nameRows.first()
        let cells = record.locator('.oxd-table-cell')
        const firstNameRecord = (await cells.nth(2).locator('div').innerText()).trim()
        const lastNameRecord  = (await cells.nth(3).locator('div').innerText()).trim()
        expect(firstNameRecord).toBe(employeeFirstName)
        expect(lastNameRecord).toBe(employeeLastName)
        
        /* 2. 根据员工ID搜索 */
        const resetButton = page.getByRole('button', {name: 'Reset'})
        await resetButton.click()

        const employeeIdInput = page.locator('.oxd-input-group', { hasText: 'Employee Id' }).locator('input')
        await employeeIdInput.fill(employeeId)

        await searchButton.click()

        // search 点击之后的等待并判断只有一条 record
        const idRows = page.locator('.oxd-table-body').locator('.oxd-table-row')
        await expect(idRows).toHaveCount(1)

        //检查这一条记录应该的 employee ID 应该 match 
        record = idRows.first()
        cells = record.locator('.oxd-table-cell')
        const employeeIdRecord = (await cells.nth(1).locator('div').innerText()).trim()
        expect(employeeIdRecord).toBe(employeeId)

    });

    test('1.3 delete employees', async ({ page }) => {
        /* Case 3: 批量删除员工 - 选中多个 Checkbox，处理确认弹窗，断言列表更新. */

        /* 先完成 add employee */
        /* 创建员工 (Happy Path) - 填写必填项，上传头像（setInputFiles），验证保存成功。 */
    });

});