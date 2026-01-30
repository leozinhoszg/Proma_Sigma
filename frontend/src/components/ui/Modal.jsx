export default function Modal({ isOpen, onClose, title, children, actions }) {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box glass-modal animate-fadeInUp">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-base-content/50 hover:text-base-content"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="font-bold text-lg mb-4 text-gradient pr-8">{title}</h3>
        <div className="py-2">{children}</div>
        {actions && (
          <div className="modal-action pt-4 border-t border-base-200/30">
            {actions}
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop bg-black/30 backdrop-blur-sm">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
