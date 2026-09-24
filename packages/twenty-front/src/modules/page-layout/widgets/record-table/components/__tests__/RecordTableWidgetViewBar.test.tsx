import { render, screen } from '@testing-library/react';

import { RecordTableWidgetViewBar } from '@/page-layout/widgets/record-table/components/RecordTableWidgetViewBar';
import { ViewType } from '~/generated-metadata/graphql';

const mockContextStoreObjectMetadataItemId = jest.fn();
const mockRecordIndexContext = jest.fn();

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue', () => ({
  useAtomComponentStateValue: () => mockContextStoreObjectMetadataItemId(),
}));
jest.mock('@/object-record/record-index/contexts/RecordIndexContext', () => ({
  useRecordIndexContextOrThrow: () => mockRecordIndexContext(),
}));
jest.mock('@/ui/layout/top-bar/components/TopBar', () => ({
  TopBar: () => <div>top bar</div>,
}));
jest.mock('@/object-record/object-options-dropdown/components/ObjectOptionsDropdown', () => ({
  ObjectOptionsDropdown: () => <div>options</div>,
}));
jest.mock('@/views/components/ViewBarFilterDropdown', () => ({
  ViewBarFilterDropdown: () => <div>filter</div>,
}));
jest.mock('@/object-record/object-sort-dropdown/components/ObjectSortDropdownButton', () => ({
  ObjectSortDropdownButton: () => <div>sort</div>,
}));
jest.mock('@/views/components/ViewBarDetails', () => ({
  ViewBarDetails: () => <div>details</div>,
}));
jest.mock('@/views/components/UpdateViewButtonGroup', () => ({
  UpdateViewButtonGroup: () => <div>update view</div>,
}));

describe('RecordTableWidgetViewBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRecordIndexContext.mockReturnValue({
      objectNamePlural: 'companies',
      recordIndexId: 'record-index-id',
      objectMetadataItem: { id: 'object-metadata-id' },
    });
  });

  it('should render the bar once the context store holds an object', () => {
    mockContextStoreObjectMetadataItemId.mockReturnValue('object-metadata-id');

    render(<RecordTableWidgetViewBar viewType={ViewType.KANBAN} />);

    expect(screen.getByText('top bar')).toBeInTheDocument();
  });

  it('should render nothing before the context store init effect has run', () => {
    mockContextStoreObjectMetadataItemId.mockReturnValue('');

    const { container } = render(
      <RecordTableWidgetViewBar viewType={ViewType.KANBAN} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when the object has no plural name', () => {
    mockContextStoreObjectMetadataItemId.mockReturnValue('object-metadata-id');
    mockRecordIndexContext.mockReturnValue({
      objectNamePlural: '',
      recordIndexId: 'record-index-id',
      objectMetadataItem: { id: 'object-metadata-id' },
    });

    const { container } = render(
      <RecordTableWidgetViewBar viewType={ViewType.KANBAN} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
