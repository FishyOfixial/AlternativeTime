import AppModal from "../common/AppModal";

export default function LayawayCreateModal({ isOpen, onClose, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <AppModal isOpen={isOpen} maxWidthClass="max-w-2xl" onClose={onClose}>
      {children}
    </AppModal>
  );
}
