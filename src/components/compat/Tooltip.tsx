import type { FC, PropsWithChildren } from 'react';

import { Tooltip as ShadcnTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type TooltipProps = PropsWithChildren<{
  title: string;
}>;

export { TooltipProvider };

export const Tooltip: FC<TooltipProps> = ({ children, title }) => (
  <ShadcnTooltip>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent>{title}</TooltipContent>
  </ShadcnTooltip>
);
