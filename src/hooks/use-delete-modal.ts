import { useCallback, useState } from 'react';

export function useDeleteModal<T>() {
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  const openDeleteModal = useCallback((item: T) => {
    setItemToDelete(item);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setItemToDelete(null);
  }, []);

  return {
    itemToDelete,
    openDeleteModal,
    closeDeleteModal,
  };
}
