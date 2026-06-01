import type { FC, ReactNode, SyntheticEvent } from 'react';
import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '../../styles/cn';

export type AutocompleteProps<T> = {
  filterOptions?: (options: T[]) => T[];
  getOptionLabel: (option: T) => string;
  loading?: boolean;
  onChange: (event: SyntheticEvent, value: null | T) => void;
  onInputChange?: (event: SyntheticEvent, value: string) => void;
  options: T[];
  renderInput: (params: {
    id: string;
    onChange: (value: string) => void;
    onFocus: () => void;
    value: string;
  }) => ReactNode;
  value: null | T;
};

export const Autocomplete = <T,>({
  filterOptions = options => options,
  getOptionLabel,
  loading: _loading,
  onChange,
  onInputChange,
  options,
  renderInput,
  value,
}: AutocompleteProps<T>): ReturnType<FC> => {
  const listId = useId();
  const inputId = useId();
  const [inputValue, setInputValue] = useState(value != null ? getOptionLabel(value) : '');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = filterOptions(options);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current != null && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option: T) => {
    onChange({} as SyntheticEvent, option);
    setInputValue(getOptionLabel(option));
    setOpen(false);
  };

  const handleInputChange = (next: string) => {
    setInputValue(next);
    onInputChange?.({} as SyntheticEvent, next);
    setOpen(true);
    setActiveIndex(0);
  };

  return (
    <div className="field field-full-width" ref={containerRef}>
      {renderInput({
        id: inputId,
        onChange: handleInputChange,
        onFocus: () => {
          setOpen(true);
        },
        value: inputValue,
      })}
      {open && filtered.length > 0 ? (
        <ul className="autocomplete-list" id={listId} role="listbox">
          {filtered.map((option, index) => (
            <li
              aria-selected={index === activeIndex}
              className={cn('autocomplete-item', index === activeIndex && 'autocomplete-item-active')}
              data-active={index === activeIndex ? 'true' : undefined}
              key={getOptionLabel(option)}
              onMouseDown={event => {
                event.preventDefault();
                handleSelect(option);
              }}
              onMouseEnter={() => {
                setActiveIndex(index);
              }}
              role="option"
            >
              {getOptionLabel(option)}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
