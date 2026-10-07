import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export type NavigationMenuItemSectionGroup = {
  section: NavigationMenuItem | null;
  items: NavigationMenuItem[];
};

// A section owns every item after it up to the next section. Items placed
// before the first section form a group without a header. A section with no
// items is dropped, so readers who cannot see its items get no empty header.
export const groupNavigationMenuItemsBySection = (
  items: NavigationMenuItem[],
): NavigationMenuItemSectionGroup[] => {
  const groups: NavigationMenuItemSectionGroup[] = [];

  for (const item of items) {
    if (item.type === NavigationMenuItemType.SECTION) {
      groups.push({ section: item, items: [] });
      continue;
    }

    const lastGroup = groups.at(-1);

    if (lastGroup === undefined) {
      groups.push({ section: null, items: [item] });
    } else {
      lastGroup.items.push(item);
    }
  }

  return groups.filter((group) => group.items.length > 0);
};
