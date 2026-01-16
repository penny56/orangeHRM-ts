import {test, expect } from '@playwright/test'
import fs from 'fs'

test.beforeEach(async ({ page }, testInfo) => {
    console.log('>>> Str to -------> ', testInfo.title)

    await page.goto("https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewLeaveList", { waitUntil: "domcontentloaded" })
    await page.waitForSelector('div.oxd-table-filter', { state: 'visible' })
});

test.afterEach(async ({ page }, testInfo) => {
    console.log('=== End of =======> ', testInfo.title)
});

test.describe('With session', () => {

    test.use({ storageState: './admin-state.json'})

    test('2.1 apply leaves', async ({ page, browser }) => {
        test.setTimeout(60000)
        /* 提交请假申请 - 练习日期选择器（Date Picker），选择跨度 3 天的假期，验证系统自动计算的天数 */

        await test.step('2.1.1 Admin entitle leave', async () => {
            /* Admin entitle leave to user-info.json : 'US - Personal' '100 days' */

            /* 0. 拿到新创建的 user-info */
            const jsonStr = fs.readFileSync('user-info.json', 'utf8')
            const userInfo = JSON.parse(jsonStr)

            /* 1. 分配假期额度 US - Personal 100*/
            const entitleButton = page.getByText('Entitlements')
            await entitleButton.click()

            const addLink = page.getByText('Add Entitlement')
            await addLink.click()

            // Add to 'Individual Employee', rather than 'Multiple'
            await page.locator('.oxd-radio-wrapper', { hasText: 'Individual Employee' }).locator('.oxd-radio-input').click()

            // fill in employee name, it is a autocomplete-text
            const employeeName = userInfo.lastName + ' ' + userInfo.firstName
            const employeeNameField = page.getByPlaceholder('Type for hints...')
            
            await employeeNameField.fill(employeeName)
            const option = page.getByRole('option', { name: employeeName })
            await option.waitFor()
            await option.click()

            // pick the 'leave type' it is a dropdown list
            const leaveTypeDropdown = page.locator('.oxd-input-group', { hasText: 'Leave Type' }).locator('.oxd-select-text')
            await leaveTypeDropdown.click()
            await page.getByRole('option', {name: 'US - Personal'}).click()

            // pick the '2026-01-01 - 2026-31-12', it is a special dropdown list
            const leavePeriodDropdown = page.locator('.oxd-input-group', { hasText: 'Leave Period' }).locator('.oxd-select-text')
            await leavePeriodDropdown.click()
            await page.getByRole('option', {name: '2026-01-01 - 2026-31-12'}).click()


            // fill the entitlement 100 days
            const entitleField = page.locator('.oxd-input-group', { hasText: 'Entitlement'}).locator('.oxd-input')
            await entitleField.fill('100')

            const saveButton = page.getByRole('button', {name: 'Save'})
            await saveButton.click()

            /* confirm */
            await page.getByRole('button', {name: 'Confirm'}).click()

            // Toast 只要出现过一次就算成功
            await page.waitForSelector('text=Successfully Saved', { timeout: 20000 })
            page.close()
        });

        await test.step('2.1.2 User apply leave', async () => {

            /* User apply leave, : 'US - Personal' '100 days' */
            const userContext = await browser.newContext({
                storageState: './user-state.json'
            });

            const userPage = await userContext.newPage()

            await userPage.goto("https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewLeaveList", { waitUntil: "domcontentloaded" })

            // 1. click apply
            const applyLink = userPage.getByRole('link', { name: 'Apply'})
            await applyLink.click()

            // 2. pick the 'leave type' it is a dropdown list
            const leaveTypeDropdown = userPage.locator('.oxd-input-group', { hasText: 'Leave Type' }).locator('.oxd-select-text')
            await leaveTypeDropdown.click()
            await userPage.getByRole('option', {name: 'US - Personal'}).click()

            const fromDateInput = userPage.locator('.oxd-input-group', { hasText: 'From Date' }).locator('input')
            await fromDateInput.fill('2026-01-20')
            await fromDateInput.blur()

            await userPage.waitForTimeout(15000)

            await userContext.close()
        });

    });

});