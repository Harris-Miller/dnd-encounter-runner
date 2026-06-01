import type { CSSProperties, FC, PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

export type PopoverProps = PropsWithChildren<{
  anchorEl: HTMLElement | null;
  onClose: () => void;
  open: boolean;
}>;

export const Popover: FC<PopoverProps> = ({ anchorEl, children, onClose, open }) => {
  if (!open || anchorEl == null) return null;

  const rect = anchorEl.getBoundingClientRect();
  const style: CSSProperties = {
    left: rect.left + rect.width / 2,
    position: 'fixed',
    top: rect.bottom + 4,
    transform: 'translateX(-50%)',
    zIndex: 1300,
  };

  return createPortal(
    <>
      <button
        aria-label="Close popover"
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'default',
          inset: 0,
          position: 'fixed',
          zIndex: 1299,
        }}
        type="button"
      />
      <div className="popover-content" style={style}>
        {children}
      </div>
    </>,
    document.body,
  );
};
