import {
  test,
  navigateToAdvisories,
  navigateToSystems,
  navigateToPackages,
} from 'test-utils';

test.describe('Advisory remediation user', () => {
  test.use({
    storageState: '.auth/ADVISORY_REMEDIATION_TOKEN.json',
    extraHTTPHeaders: process.env.ADVISORY_REMEDIATION_TOKEN
      ? { Authorization: process.env.ADVISORY_REMEDIATION_TOKEN }
      : {},
  });

  test('navigate to advisories', async ({ page, systems }) => {
    await systems.add(
      'advisory-remediation-user-test',
      'base',
      process.env.ADVISORY_REMEDIATION_TOKEN,
    );
    
    await navigateToAdvisories(page);
    await navigateToSystems(page);
    await navigateToPackages(page);
    })

});