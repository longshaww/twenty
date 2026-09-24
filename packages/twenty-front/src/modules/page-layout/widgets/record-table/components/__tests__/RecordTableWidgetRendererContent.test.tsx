import { render, screen } from '@testing-library/react';

import { RecordTableWidgetRendererContent } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent';
import { ViewCalendarLayout, ViewType } from '~/generated-metadata/graphql';

const mockUseViewById = jest.fn();
const mockIsPageLayoutInEditMode = jest.fn();

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: jest.fn(() => ({
    objectMetadataItem: { nameSingular: 'company' },
  })),
}));
jest.mock('@/page-layout/hooks/useIsPageLayoutInEditMode', () => ({
  useIsPageLayoutInEditMode: () => mockIsPageLayoutInEditMode(),
}));
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue',
  () => ({ useAtomComponentFamilySelectorValue: jest.fn(() => undefined) }),
);
jest.mock('@/views/hooks/useViewById', () => ({
  useViewById: () => mockUseViewById(),
}));
jest.mock(
  '@/object-record/record-table-widget/components/RecordTableWidgetProvider',
  () => ({
    RecordTableWidgetProvider: ({ children }: { children: React.ReactNode }) =>
      children,
  }),
);
jest.mock(
  '@/object-record/record-table-widget/components/RecordTableWidget',
  () => ({ RecordTableWidget: () => <div>record table widget</div> }),
);
jest.mock(
  '@/page-layout/widgets/record-table/components/RecordTableWidgetViewBar',
  () => ({
    RecordTableWidgetViewBar: ({ viewType }: { viewType: string }) => (
      <div>widget view bar for {viewType}</div>
    ),
  }),
);
jest.mock(
  '@/object-record/record-board-widget/components/RecordBoardWidget',
  () => ({ RecordBoardWidget: () => <div>record board widget</div> }),
);
jest.mock(
  '@/object-record/record-list-widget/components/RecordListWidget',
  () => ({
    RecordListWidget: () => <div>record list widget</div>,
  }),
);
jest.mock(
  '@/object-record/record-calendar-widget/components/RecordCalendarWidget',
  () => ({
    RecordCalendarWidget: ({ isReadOnly }: { isReadOnly: boolean }) => (
      <div>
        record calendar widget
        <button disabled={isReadOnly}>Create calendar record</button>
      </div>
    ),
  }),
);

const renderWidgetForViewType = (viewType: ViewType | undefined) => {
  mockUseViewById.mockReturnValue({
    view:
      viewType === undefined ? undefined : { id: 'view-id', type: viewType },
  });

  render(
    <RecordTableWidgetRendererContent
      objectMetadataId="object-metadata-id"
      viewId="view-id"
      widgetId="widget-id"
    />,
  );
};

describe('RecordTableWidgetRendererContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPageLayoutInEditMode.mockReturnValue(false);
  });

  it.each([
    [ViewCalendarLayout.DAY, false, false],
    [ViewCalendarLayout.WEEK, false, false],
    [ViewCalendarLayout.MONTH, false, true],
    [ViewCalendarLayout.DAY, true, true],
    [ViewCalendarLayout.WEEK, true, true],
  ])(
    'renders %s with edit mode %s as read-only %s',
    (calendarLayout, isEditMode, isReadOnly) => {
      mockIsPageLayoutInEditMode.mockReturnValue(isEditMode);
      mockUseViewById.mockReturnValue({
        view: { id: 'view-id', type: ViewType.CALENDAR_WIDGET, calendarLayout },
      });

      render(
        <RecordTableWidgetRendererContent
          objectMetadataId="object-metadata-id"
          viewId="view-id"
          widgetId="widget-id"
        />,
      );

      const createButton = screen.getByRole('button', {
        name: 'Create calendar record',
      });

      if (isReadOnly) {
        expect(createButton).toBeDisabled();
      } else {
        expect(createButton).toBeEnabled();
      }
    },
  );

  it.each([
    [ViewType.TABLE_WIDGET, 'record table widget'],
    [ViewType.KANBAN_WIDGET, 'record board widget'],
    [ViewType.LIST_WIDGET, 'record list widget'],
    [ViewType.CALENDAR_WIDGET, 'record calendar widget'],
  ])('should render %s with its own widget', (viewType, expectedWidget) => {
    renderWidgetForViewType(viewType);

    expect(screen.getByText(expectedWidget)).toBeVisible();
  });

  it('should render a non-widget list view as a list', () => {
    renderWidgetForViewType(ViewType.LIST);

    expect(screen.getByText('record list widget')).toBeVisible();
  });

  it('should render a widget with no view as a table', () => {
    renderWidgetForViewType(undefined);

    expect(screen.getByText('record table widget')).toBeVisible();
  });

  // Filter, Sort and Options belong to the record index page, which mounts
  // RecordIndexViewBar as its secondaryBar. Without this the widget draws a
  // board nobody can filter.
  it('should render the view bar, told which layout it is over', () => {
    renderWidgetForViewType(ViewType.KANBAN_WIDGET);

    expect(
      screen.getByText(`widget view bar for ${ViewType.KANBAN}`),
    ).toBeVisible();
  });

  // In edit mode the widget shows a DRAFT of the view, so a bar acting on the
  // view's own filters would be editing something else than what is on screen.
  it('should hide the view bar while the page layout is being edited', () => {
    mockIsPageLayoutInEditMode.mockReturnValue(true);
    renderWidgetForViewType(ViewType.KANBAN_WIDGET);

    expect(screen.queryByText(/widget view bar/)).not.toBeInTheDocument();
    expect(screen.getByText('record board widget')).toBeVisible();
  });
});
