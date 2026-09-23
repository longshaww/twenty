import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { isDefined } from 'twenty-shared/utils';

type GetPageLayoutTabListInitialActiveTabIdParams = {
  activeTabId: string | null;
  tabs: PageLayoutTab[];
  lastActiveTabId?: string;
  defaultTabToFocusOnMobileAndSidePanelId?: string;
  isMobile: boolean;
  isInSidePanel: boolean;
};

export const getPageLayoutTabListInitialActiveTabId = ({
  activeTabId,
  tabs,
  lastActiveTabId,
  defaultTabToFocusOnMobileAndSidePanelId,
  isMobile,
  isInSidePanel,
}: GetPageLayoutTabListInitialActiveTabIdParams): string | null => {
  const activeTabExists = tabs.some((tab) => tab.id === activeTabId);

  if (activeTabExists) {
    return activeTabId;
  }

  // Below a URL hash, which has already written itself into activeTabId by the
  // time this runs, and above the mobile default, which is a page-wide setting
  // rather than something this person chose.
  if (isDefined(lastActiveTabId)) {
    const lastActiveTabExists = tabs.some((tab) => tab.id === lastActiveTabId);

    if (lastActiveTabExists) {
      return lastActiveTabId;
    }
  }

  const isOnMobileOrSidePanel = isMobile || isInSidePanel;

  if (
    isOnMobileOrSidePanel &&
    isDefined(defaultTabToFocusOnMobileAndSidePanelId)
  ) {
    const defaultTabExists = tabs.some(
      (tab) => tab.id === defaultTabToFocusOnMobileAndSidePanelId,
    );

    if (defaultTabExists) {
      return defaultTabToFocusOnMobileAndSidePanelId;
    }
  }

  return tabs[0]?.id ?? null;
};
