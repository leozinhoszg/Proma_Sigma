export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'error' }) {
  if (!isOpen) return null;

  const variantClasses = {
    error: 'btn-error',
    warning: 'btn-warning',
    success: 'btn-success',
    info: 'btn-info'
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{message}</p>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            {cancelText}
          </button>
          <button className={`btn ${variantClasses[variant]}`} onClick={() => { onConfirm(); onClose(); }}>
            {confirmText}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
