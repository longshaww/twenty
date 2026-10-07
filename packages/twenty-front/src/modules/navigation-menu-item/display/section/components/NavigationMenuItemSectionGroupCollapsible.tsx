import { type ReactNode } from 'react';

import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';

type NavigationMenuItemSectionGroupCollapsibleProps = {
  sectionId: string;
  header: ReactNode;
  children: ReactNode;
};

export const NavigationMenuItemSectionGroupCollapsible = ({
  sectionId,
  header,
  children,
}: NavigationMenuItemSectionGroupCollapsibleProps) => {
  const { isNavigationSectionOpen } = useNavigationSection(sectionId);

  return (
    <>
      {header}
      {isNavigationSectionOpen && children}
    </>
  );
};
