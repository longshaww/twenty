import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { groupNavigationMenuItemsBySection } from '@/navigation-menu-item/display/section/utils/groupNavigationMenuItemsBySection';

const buildItem = (
  id: string,
  type: NavigationMenuItemType = NavigationMenuItemType.LINK,
): NavigationMenuItem =>
  ({ id, type, name: id, position: 0 }) as NavigationMenuItem;

const toIds = (groups: ReturnType<typeof groupNavigationMenuItemsBySection>) =>
  groups.map(({ section, items }) => ({
    section: section?.id ?? null,
    items: items.map(({ id }) => id),
  }));

describe('groupNavigationMenuItemsBySection', () => {
  it('should return a single headerless group when there is no section', () => {
    expect(
      toIds(
        groupNavigationMenuItemsBySection([buildItem('a'), buildItem('b')]),
      ),
    ).toEqual([{ section: null, items: ['a', 'b'] }]);
  });

  it('should give each section the items up to the next section', () => {
    expect(
      toIds(
        groupNavigationMenuItemsBySection([
          buildItem('a'),
          buildItem('s1', NavigationMenuItemType.SECTION),
          buildItem('b'),
          buildItem('c', NavigationMenuItemType.FOLDER),
          buildItem('s2', NavigationMenuItemType.SECTION),
          buildItem('d'),
        ]),
      ),
    ).toEqual([
      { section: null, items: ['a'] },
      { section: 's1', items: ['b', 'c'] },
      { section: 's2', items: ['d'] },
    ]);
  });

  it('should drop sections without items', () => {
    expect(
      toIds(
        groupNavigationMenuItemsBySection([
          buildItem('s1', NavigationMenuItemType.SECTION),
          buildItem('s2', NavigationMenuItemType.SECTION),
          buildItem('a'),
          buildItem('s3', NavigationMenuItemType.SECTION),
        ]),
      ),
    ).toEqual([{ section: 's2', items: ['a'] }]);
  });

  it('should return no group for an empty list', () => {
    expect(groupNavigationMenuItemsBySection([])).toEqual([]);
  });
});
