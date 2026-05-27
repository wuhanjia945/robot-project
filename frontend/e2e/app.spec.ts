import { test, expect } from '@playwright/test'

test.describe('一起动手来手搓机器人', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('首页加载正常', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
  })

  test('导航到市场方案', async ({ page }) => {
    await page.getByText('市场方案').first().click()
    await expect(page.locator('h1')).toContainText('市场方案')
  })

  test('市场方案-点击机器人查看详情', async ({ page }) => {
    await page.getByText('市场方案').first().click()
    await page.waitForTimeout(2000)
    const cardText = page.locator('text=点击查看详细方案')
    const count = await cardText.count()
    if (count > 0) {
      await cardText.first().click()
      await page.waitForTimeout(1500)
      const backBtn = page.locator('button:has-text("返回列表")')
      await expect(backBtn).toBeVisible({ timeout: 5000 })
    }
  })

  test('市场方案-入门知识切换', async ({ page }) => {
    await page.getByText('市场方案').first().click()
    await page.waitForTimeout(1000)
    const btn = page.getByText('入门知识')
    if (await btn.count() > 0) {
      await btn.click()
      await page.waitForTimeout(500)
    }
  })

  test('市场方案-前沿技术切换', async ({ page }) => {
    await page.getByText('市场方案').first().click()
    await page.waitForTimeout(1000)
    const btn = page.getByText('前沿技术')
    if (await btn.count() > 0) {
      await btn.click()
      await page.waitForTimeout(500)
    }
  })

  test('导航到需求采集', async ({ page }) => {
    await page.getByText('需求采集').first().click()
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('导航到算法供给', async ({ page }) => {
    await page.getByText('算法供给').first().click()
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('算法供给-点击算法查看详情', async ({ page }) => {
    await page.getByText('算法供给').first().click()
    await page.waitForTimeout(1000)
    const cards = page.locator('[style*="cursor: pointer"]')
    if (await cards.count() > 0) {
      await cards.first().click()
      await page.waitForTimeout(500)
    }
  })

  test('导航到硬件方案', async ({ page }) => {
    await page.getByText('硬件方案').first().click()
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  test('导航到仿真学习', async ({ page }) => {
    await page.getByText('仿真学习').first().click()
    await expect(page.locator('h1')).toContainText('仿真')
  })

  test('导航到反馈', async ({ page }) => {
    await page.getByText('反馈').first().click()
    await expect(page.locator('h1')).toContainText('反馈')
  })

  test('反馈表单提交', async ({ page }) => {
    await page.getByText('反馈').first().click()
    await page.waitForTimeout(500)
    const select = page.locator('select').first()
    if (await select.count() > 0) {
      await select.selectOption({ index: 1 })
    }
    const selectRole = page.locator('select').nth(1)
    if (await selectRole.count() > 0) {
      await selectRole.selectOption({ index: 1 })
    }
    const titleInput = page.locator('input[placeholder*="标题"]')
    if (await titleInput.count() > 0) {
      await titleInput.fill('测试反馈标题')
    }
    const textarea = page.locator('textarea').first()
    if (await textarea.count() > 0) {
      await textarea.fill('这是一条Playwright自动化测试的反馈内容')
    }
    const submitBtn = page.getByRole('button', { name: '提交反馈' })
    if (await submitBtn.count() > 0) {
      await submitBtn.click()
      await page.waitForTimeout(1000)
    }
  })
})
