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
        test.setTimeout(60000)
        /* 创建员工 (Happy Path) - 填写必填项，上传头像（setInputFiles），验证保存成功。 */

        /* 点击Add */ 
        const addButton = page.getByRole('button', {name: 'Add'})
        await expect(addButton).toBeVisible()
        await addButton.click()
        await expect(page.getByRole('heading', {name: 'Add Employee'})).toBeVisible()

        /* 添加employee */
        const code = String(Math.floor(Math.random() * 999999) + 1)
        const firstNameField = page.getByPlaceholder('First Name')
        await firstNameField.fill(code)
        const lastNameField = page.getByPlaceholder('Last Name')
        await lastNameField.fill('user')
        const employeeIdField = page.locator('.oxd-input-group', { hasText: 'Employee Id' }).locator('input.oxd-input')
        await employeeIdField.fill(code)

        /* 添加头像 */
        const imageButton = page.locator('button.employee-image-action')
        await imageButton.click()

        // 在“隐藏的”input 上上传头像
        await page.locator('input[type="file"]').setInputFiles('./cat.png')


        /* 同时添加 login: create login details */
        await page.locator('.oxd-switch-wrapper').locator('.oxd-switch-input').click()
        /* 等待 login 信息出现 */
        await page.getByText('Username', { exact: true }).waitFor()

        const loginInfo = `user${code}`
        await page.locator('.oxd-input-group', { hasText: 'Username' }).locator('input').fill(loginInfo)
        await page.locator('.oxd-input-group', { hasText: 'Password' }).nth(0).locator('input').fill(loginInfo)
        await page.locator('.oxd-input-group', { hasText: 'Password' }).nth(1).locator('input').fill(loginInfo)

        /* 点击 enabled */
        await page.locator('.oxd-radio-wrapper', { hasText: 'Enabled' }).locator('.oxd-radio-input').click()

        /* 点击 save */
        const saveButton = page.getByRole('button', {name: 'Save'})
        await saveButton.click()

        /* 验证创建用户成功 */
        // Toast 只要出现过一次就算成功
        await page.waitForSelector('text=Successfully Saved', { timeout: 20000 })

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

        /* 添加employee */
        const code = String(Math.floor(Math.random() * 999999) + 1)
        const firstNameField = page.getByPlaceholder('First Name')
        await firstNameField.fill(code)
        const lastNameField = page.getByPlaceholder('Last Name')
        await lastNameField.fill('user')

        const employeeIdField = page.locator('.oxd-input-group', { hasText: 'Employee Id' }).locator('input.oxd-input')
        await employeeIdField.fill(code)

        /* 记录员工信息,search 时用 */
        const employeeFirstName = code
        const employeeLastName = 'user'
        const employeeId = code

        /* 同时添加login: create login details */
        await page.locator('.oxd-switch-wrapper').locator('.oxd-switch-input').click()
        /* 等待 login 信息出现 */
        await page.getByText('Username', { exact: true }).waitFor()

        const loginInfo = `user${code}`
        await page.locator('.oxd-input-group', { hasText: 'Username' }).locator('input').fill(loginInfo)
        await page.locator('.oxd-input-group', { hasText: 'Password' }).nth(0).locator('input').fill(loginInfo)
        await page.locator('.oxd-input-group', { hasText: 'Password' }).nth(1).locator('input').fill(loginInfo)

        /* 点击 enabled */
        await page.locator('.oxd-radio-wrapper', { hasText: 'Enabled' }).locator('.oxd-radio-input').click()

        /* 点击 save */
        const saveButton = page.getByRole('button', {name: 'Save'})
        await saveButton.click()

        /* 验证创建用户成功 */
        // 只要出现过一次就算成功
        await page.waitForSelector('text=Successfully Saved', { timeout: 20000 })

        /* 回到 employee list */
        await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList')

        /* 1. 根据员工姓名搜索 */
        const employeeName = `${employeeFirstName} ${employeeLastName}`
        const employeeNameInput = page.locator('.oxd-input-group', { hasText: 'Employee Name' }).locator('input[placeholder="Type for hints..."]')
        await employeeNameInput.fill(employeeName)

        // 因为是 autocomplete-text ，等待联想出现
        const option = page.getByRole('option', { name: employeeName })
        await option.waitFor()
        await option.click()

        const searchButton = page.getByRole('button', {name: 'Search'})
        await searchButton.click()

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

        // 先等表格进入 loading（变成 0 行）；再等最终结果
        await expect(idRows).toHaveCount(0)
        await expect(idRows).toHaveCount(1)

        //检查这一条记录应该的 employee ID 应该 match 
        record = idRows.first()
        cells = record.locator('.oxd-table-cell')
        const employeeIdRecord = (await cells.nth(1).locator('div').innerText()).trim()
        expect(employeeIdRecord).toBe(employeeId)

    });

    test('1.3 delete employees', async ({ page }) => {
        /* Case 3: 批量删除员工 - 选中多个 Checkbox，处理确认弹窗，断言列表更新. */

        /* 1. 点击 table header 里 ”全选“ 的 checkbox */
        const allCheck = page.locator('div.oxd-table-header').locator('.oxd-checkbox-input')
        await allCheck.check()

        // 2. 用 locator 定义 delete 按钮（不要 click，不要 expect）
        const deleteAllButton = page.getByRole('button', {name: ' Delete Selected '})

        // 3. 立即判断是否存在
        const hasRecord = (await deleteAllButton.count()) > 0
        test.skip(!hasRecord, '没有员工记录，跳过批量删除')

        // 4. 存在才执行删除
        await deleteAllButton.click()

        // 5. 删除确认
        await page.getByRole('button', { name: ' Yes, Delete ' }).click()

        // 6. 确认成功
        // 只要出现过一次就算成功
        const successToast = page.getByText('Successfully Deleted')
        await expect(successToast).toBeVisible({ timeout: 5000 })


    });

});