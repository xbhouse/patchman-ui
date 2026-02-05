import {
  test,
  expect,
  navigateToAdvisories,
  getRowByName,
  waitForTableLoad,
  closePopupsIfExist,
  getRowCellByHeader,
} from 'test-utils';
import { cleanupRemediationPlan } from 'test-utils/helpers/cleaners';

test.describe('Advisories Tests', () => {
  test('Create a new remediation plan', async ({ page, request, systems, cleanup }) => {
    let numAffectedSystems: number;
    const system = await systems.add('system-remediation-plan-test', 'base');

    await navigateToAdvisories(page);
    await closePopupsIfExist(page);

    const planButton = page.getByRole('button', { name: 'Plan remediation' });
    await expect(planButton).toBeDisabled();

    await test.step('Select an advisory and check that the button is enabled', async () => {
      const firstRow = page.locator('tbody > tr').first();
      const checkbox = firstRow.getByRole('checkbox', { name: 'Select row 0' });
      await checkbox.check();
      await expect(checkbox).toBeChecked();

      const affectedSystemsCell = await getRowCellByHeader(page, firstRow, 'Affected systems');
      numAffectedSystems = Number((await affectedSystemsCell.textContent())?.trim() ?? '0');
      expect(numAffectedSystems).toBeGreaterThan(0);

      await expect(planButton).toBeEnabled();
    });

    let remediationPlanId: string;

    await test.step('Click the button and create a plan', async () => {
      await planButton.click();
      await expect(page.getByText('Plan a remediation')).toBeVisible();

      await page.getByRole('combobox', { name: 'Type to filter' }).fill(system.name);
      await page.locator('#select-typeahead-create').click();
      await page.getByRole('button', { name: 'Create plan' }).click();
      await expect(page.locator('h1').getByText(system.name)).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Details' })).toBeVisible({
        timeout: 180_000,
      });
      remediationPlanId = (page.url().split('/').pop() ?? '').split('#')[0];
    });

    await test.step('Set up cleanup', async () => {
      cleanup.add(() => cleanupRemediationPlan(request, remediationPlanId));
    });

    await test.step('Check actions, systems, and execution history tabs', async () => {
      await page.getByRole('tab', { name: 'PlannedRemediationsTab' }).click();
      await expect(page.getByRole('tab', { name: 'PlannedRemediationsTab' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await expect(page.getByRole('tab', { name: 'ActionsTab' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await waitForTableLoad(page);
      await expect(page.getByRole('row')).toHaveCount(2); // 1 advisory + header row

      await page.getByRole('tab', { name: 'SystemsTab' }).click();
      await expect(page.getByRole('tab', { name: 'SystemsTab' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await waitForTableLoad(page);
      await expect(await getRowByName(page, system.name)).toBeVisible();
      await expect(page.getByRole('row')).toHaveCount(numAffectedSystems + 1); // number of affected systems + header row

      await page.getByRole('tab', { name: 'ExecutionHistoryTab' }).click();
      await expect(page.getByRole('tab', { name: 'ExecutionHistoryTab' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await waitForTableLoad(page);
      await expect(page.getByText('No execution history')).toBeVisible();
    });
  });
});
