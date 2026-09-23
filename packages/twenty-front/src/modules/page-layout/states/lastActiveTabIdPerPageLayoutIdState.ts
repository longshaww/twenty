import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// The active tab otherwise lives in a component state keyed by page layout AND
// record id, so it dies on reload and never carries from one record to the next:
// every record opens on its first tab however many times you have left it on
// another one. Keyed by page layout, which is one per object for a record page.
export const lastActiveTabIdPerPageLayoutIdState = createAtomState<Record<
  string,
  string
> | null>({
  key: 'lastActiveTabIdPerPageLayoutIdState',
  defaultValue: null,
  useLocalStorage: true,
});
