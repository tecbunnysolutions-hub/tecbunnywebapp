import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm", children: _jsxs("div", { className: "bg-slate-900 text-slate-100 border border-white/10 rounded-lg shadow-lg p-6 relative", children: [_jsx("button", { className: "absolute top-2 right-2 text-slate-400 hover:text-white", onClick: onClose, "aria-label": "Close modal", children: "\u00D7" }), children] }) }));
};
export { Modal };
export default Modal;
