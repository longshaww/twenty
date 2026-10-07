import { styled } from '@linaria/react';
import { useIcons } from 'twenty-ui/icon';
import {
  DEFAULT_THEME_COLOR_FALLBACK,
  themeCssVariables,
} from 'twenty-ui/theme';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { SECTION_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/SectionIconDefault';
import type { NavigationMenuItemSectionContentProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionContentProps';
import { NavigationMenuItemEditable } from '@/navigation-menu-item/edit/components/NavigationMenuItemEditable';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledDivider = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  margin-top: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

type NavigationMenuItemSectionHeaderProps = Pick<
  NavigationMenuItemSectionContentProps,
  'item' | 'editModeProps' | 'isDragging' | 'rightOptions'
>;

export const NavigationMenuItemSectionHeader = ({
  item,
  editModeProps,
  isDragging,
  rightOptions,
}: NavigationMenuItemSectionHeaderProps) => {
  const { getIcon } = useIcons();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { isNavigationSectionOpen, toggleNavigationSection } =
    useNavigationSection(item.id);

  const SectionIcon = getIcon(item.icon ?? SECTION_ICON_DEFAULT);
  const label = item.name ?? '';

  if (isLayoutCustomizationModeEnabled) {
    return (
      <StyledDivider>
        <NavigationMenuItemEditable item={item}>
          <NavigationDrawerItem
            label={label}
            Icon={() => (
              <ColoredIcon
                Icon={SectionIcon}
                color={DEFAULT_THEME_COLOR_FALLBACK}
              />
            )}
            onClick={editModeProps?.onEditModeClick}
            active={false}
            isSelectedInEditMode={editModeProps?.isSelectedInEditMode}
            isDragging={isDragging}
            className="navigation-drawer-item"
            triggerEvent="CLICK"
            rightOptions={rightOptions}
          />
        </NavigationMenuItemEditable>
      </StyledDivider>
    );
  }

  return (
    <StyledDivider>
      <NavigationDrawerSectionTitle
        label={label}
        Icon={SectionIcon}
        isOpen={isNavigationSectionOpen}
        onClick={toggleNavigationSection}
      />
    </StyledDivider>
  );
};
