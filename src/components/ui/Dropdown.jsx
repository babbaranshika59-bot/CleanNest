import { useEffect, useRef, useState } from "react";

// Generic dropdown. `trigger` is the button content; `children` may be a node or (close) => node.
export default function Dropdown({ trigger, children, align = "right", label, triggerClassName = "", panelClassName = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  return (
    <div className="dropdown" ref={ref}>
      <button type="button" className={`dropdown-trigger ${triggerClassName}`} aria-haspopup="true" aria-expanded={open} aria-label={label} onClick={() => setOpen((o) => !o)}>
        {trigger}
      </button>
      {open && <div className={`dropdown-panel dropdown-${align} ${panelClassName}`}>{typeof children === "function" ? children(close) : children}</div>}
    </div>
  );
}
