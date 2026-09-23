import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Keyed by file name, matching agentChatSelectedFilesState, which is also
// deduplicated by name. Holds live AbortControllers, so it is never persisted.
export const agentChatUploadAbortControllersState = createAtomState<
  Record<string, AbortController>
>({
  key: 'ai/agentChatUploadAbortControllersState',
  defaultValue: {},
});
