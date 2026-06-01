import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { FC, PropsWithChildren } from 'react';

export type TooltipProps = PropsWithChildren<{
  title: string;
}>;

export const TooltipProvider: FC<PropsWithChildren> = ({ children }) => (
  <TooltipPrimitive.Provider delayDuration={300}>{children}</TooltipPrimitive.Provider>
);

export const Tooltip: FC<TooltipProps> = ({ children, title }) => (
  <TooltipPrimitive.Root>
    <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content className="tooltip-content" sideOffset={4}>
        {title}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  </TooltipPrimitive.Root>
);
