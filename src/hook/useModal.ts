import { useCallback, useState } from "react";

export const useModal = () => {
  const [openModal, setOpenModal] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense' | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const handleOpenModal = useCallback((type: 'income' | 'expense', id?: number) => {
    setFormType(type);
    setEditId(id ?? null);
    setOpenModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setFormType(null);
    setEditId(null);
    setOpenModal(false);
  }, []);

  return { openModal, formType, editId, handleOpenModal, handleCloseModal };
};
