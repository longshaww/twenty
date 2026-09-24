import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { ObjectOptionsDropdown } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdown';
import { ObjectSortDropdownButton } from '@/object-record/object-sort-dropdown/components/ObjectSortDropdownButton';
import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { getObjectSortDropdownId } from '@/object-record/object-sort-dropdown/utils/getObjectSortDropdownId';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { TopBar } from '@/ui/layout/top-bar/components/TopBar';
import { UpdateViewButtonGroup } from '@/views/components/UpdateViewButtonGroup';
import { ViewBarDetails } from '@/views/components/ViewBarDetails';
import { ViewBarFilterDropdown } from '@/views/components/ViewBarFilterDropdown';
import { getViewBarFilterDropdownId } from '@/views/utils/getViewBarFilterDropdownId';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type ViewType } from '@/views/types/ViewType';
import { isNonEmptyString } from '@sniptt/guards';

type RecordTableWidgetViewBarProps = {
  viewType: ViewType;
};

// A record table widget draws the view's records but not the bar that makes a
// view usable: Filter, Sort and Options belong to the record index page, which
// mounts RecordIndexViewBar as its secondaryBar. A widget embedded in a page
// layout therefore renders a board nobody can filter.
//
// This is that bar, minus the three parts that only make sense on a page of
// their own. The view picker is out because a widget is bound to one view by
// its manifest, so switching would break the binding. The page title is out
// because a widget does not own the page. The query-param effects are out
// because several widgets can share one URL and would fight over it.
export const RecordTableWidgetViewBar = ({
  viewType,
}: RecordTableWidgetViewBarProps) => {
  const { objectNamePlural, recordIndexId, objectMetadataItem } =
    useRecordIndexContextOrThrow();

  // The widget fills its context store from an effect, so the first render has
  // an empty object metadata id. Options reads that id while it mounts and
  // throws on an empty one, which the widget's error boundary then reports as
  // an invalid configuration. Wait the one render out.
  const contextStoreObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  if (
    !objectNamePlural ||
    !isNonEmptyString(contextStoreObjectMetadataItemId)
  ) {
    return null;
  }

  return (
    <ObjectSortDropdownComponentInstanceContext.Provider
      value={{ instanceId: getObjectSortDropdownId(recordIndexId) }}
    >
      <TopBar
        rightComponent={
          <>
            <ObjectFilterDropdownComponentInstanceContext.Provider
              value={{ instanceId: getViewBarFilterDropdownId(recordIndexId) }}
            >
              <ViewBarFilterDropdown />
            </ObjectFilterDropdownComponentInstanceContext.Provider>
            <ObjectSortDropdownButton />
            <ObjectOptionsDropdown
              recordIndexId={recordIndexId}
              objectMetadataItem={objectMetadataItem}
              viewType={viewType}
            />
          </>
        }
        bottomComponent={
          <ViewBarDetails
            hasFilterButton
            viewBarId={recordIndexId}
            objectNamePlural={objectNamePlural}
            rightComponent={<UpdateViewButtonGroup />}
          />
        }
      />
    </ObjectSortDropdownComponentInstanceContext.Provider>
  );
};
