import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { FC, PropsWithChildren } from 'react';

export type MenuProps = PropsWithChildren<{
  onClose: () => void;
  open: boolean;
}>;

export const Menu: FC<MenuProps> = ({ children, onClose, open }) => {
  if (!open) return null;

  return (
    <DropdownMenu.Root
      onOpenChange={nextOpen => {
        if (!nextOpen) onClose();
      }}
      open={open}
    >
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="dropdown-content"
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
          side="bottom"
          sideOffset={4}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export type MenuItemProps = PropsWithChildren<{
  onClick?: () => void;
}>;

export const MenuItem: FC<MenuItemProps> = ({ children, onClick }) => (
  <DropdownMenu.Item
    className="dropdown-item"
    onSelect={() => {
      onClick?.();
    }}
  >
    {children}
  </DropdownMenu.Item>
);
