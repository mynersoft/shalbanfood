// hooks/useModal.js
import { useState, useCallback } from "react";

const useModal = (initialState = false) => {
	const [isOpen, setIsOpen] = useState(initialState);

	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);
	const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

	return {
		isOpen,
		open,
		close,
		toggle,
		setIsOpen,
	};
};

export default useModal;
