import {
  test,
  navigateToAdvisories,
  navigateToSystems,
  navigateToPackages,
} from 'test-utils';

test.describe('Default user', () => {
  test('navigate to advisories', async ({ page, systems }) => {
     await systems.add(
      'default-user-test',
      'base',
    );
    
    await navigateToAdvisories(page);
     await navigateToSystems(page);
    await navigateToPackages(page);
    })
});