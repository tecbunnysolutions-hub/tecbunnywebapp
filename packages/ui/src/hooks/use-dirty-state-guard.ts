import * as React from 'react';

type DirtyStateGuardOptions = {
  isDirty: boolean;
  message?: string;
};

export function useDirtyStateGuard({ isDirty, message = 'You have unsaved changes.' }: DirtyStateGuardOptions) {
  React.useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, message]);

  const canProceed = React.useCallback(() => !isDirty, [isDirty]);

  return { canProceed };
}