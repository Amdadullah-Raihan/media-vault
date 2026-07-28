import { useState, useCallback } from 'react';

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
    variant: 'destructive' | 'default';
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    variant: 'default',
  });

  const confirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      variant: 'destructive' | 'default' = 'default',
    ) => {
      setState({ open: true, title, message, onConfirm, variant });
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    state.onConfirm?.();
    setState((s) => ({ ...s, open: false }));
  }, [state.onConfirm]);

  const handleClose = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  return {
    confirm,
    confirmState: state,
    handleConfirm,
    handleClose,
  };
}
