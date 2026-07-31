import { useState, useCallback } from 'react';
export function useConfirm() {
    const [state, setState] = useState({
        open: false,
        title: '',
        message: '',
        onConfirm: null,
        variant: 'default',
    });
    const confirm = useCallback((title, message, onConfirm, variant = 'default') => {
        setState({ open: true, title, message, onConfirm, variant });
    }, []);
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
//# sourceMappingURL=use-confirm.js.map