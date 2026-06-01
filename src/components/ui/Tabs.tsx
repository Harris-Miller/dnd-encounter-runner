import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Children, isValidElement } from 'react';
import type { FC, ReactElement, ReactNode, SyntheticEvent } from 'react';

export type TabsProps = {
  children: ReactNode;
  onChange?: (event: SyntheticEvent, value: string) => void;
  value: string;
};

export type TabProps = {
  label: string;
  value: string;
};

export const Tab: FC<TabProps> = () => null;

export const Tabs: FC<TabsProps> = ({ children, onChange, value }) => {
  const tabs = Children.toArray(children).filter(
    (child): child is ReactElement<TabProps> => isValidElement(child) && child.type === Tab,
  );

  return (
    <TabsPrimitive.Root
      onValueChange={nextValue => {
        onChange?.({} as SyntheticEvent, nextValue);
      }}
      value={value}
    >
      <TabsPrimitive.List className="tabs-list">
        {tabs.map(tab => (
          <TabsPrimitive.Trigger className="tab" key={tab.props.value} value={tab.props.value}>
            {tab.props.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {tabs.map(tab => (
        <TabsPrimitive.Content key={tab.props.value} value={tab.props.value} />
      ))}
    </TabsPrimitive.Root>
  );
};
