import { useAlertStore } from "@/stores/alert.store";
import { useConfirmStore } from "@/stores/confirm.store";

export const useNotify = () => {
  const alert = useAlertStore();
  const confirm = useConfirmStore();

  const success = (message, title = "") => alert.success(message, title);
  const error = (message, title = "") => alert.error(message, title);
  const warning = (message, title = "") => alert.warning(message, title);
  const info = (message, title = "") => alert.info(message, title);

  const confirmDelete = (name) =>
    confirm.open({
      title: "Hapus Data",
      message: `Yakin ingin menghapus "${name}"? Data tidak bisa dikembalikan.`,
      confirmText: "Ya, Hapus",
      type: "danger",
    });

  const confirmAction = ({ title, message, confirmText, type = "warning" }) =>
    confirm.open({
      title,
      message,
      confirmText,
      type,
    });

  const setLoading = (val) => confirm.setLoading(val);
  const closeConfirm = () => {
    confirm.show = false;
  };

  return {
    success,
    error,
    warning,
    info,
    confirmDelete,
    confirmAction,
    setLoading,
    closeConfirm,
  };
};
