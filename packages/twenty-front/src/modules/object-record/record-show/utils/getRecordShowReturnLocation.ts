import { isValidReturnToPath } from '@/auth/utils/isValidReturnToPath';

// A record page can be reached from somewhere that is not its object's index:
// a custom page, a dashboard, a related record. The breadcrumb can only guess at
// an index view, so whoever navigated may say where "back" actually is.
export const getRecordShowReturnLocation = (historyState: unknown) => {
  if (
    typeof historyState !== 'object' ||
    historyState === null ||
    !('returnLocation' in historyState)
  ) {
    return null;
  }

  const { returnLocation } = historyState;

  return typeof returnLocation === 'string' &&
    isValidReturnToPath(returnLocation)
    ? returnLocation
    : null;
};
