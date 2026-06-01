import type { FC, ReactNode, SyntheticEvent } from 'react';
import { useEffect, useId, useRef, useState } from 'react';

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
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {renderInput({
        id: inputId,
        onChange: handleInputChange,
        onFocus: () => {
          setOpen(true);
        },
        value: inputValue,
      })}
      {open && filtered.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          style={{
            backgroundColor: 'var(--color-bg-paper)',
            border: '1px solid var(--color-divider)',
            borderRadius: 6,
            listStyle: 'none',
            margin: '4px 0 0',
            maxHeight: 240,
            overflow: 'auto',
            padding: 4,
            position: 'absolute',
            width: '100%',
            zIndex: 1300,
          }}
        >
          {filtered.map((option, index) => (
            <li
              aria-selected={index === activeIndex}
              key={getOptionLabel(option)}
              onMouseDown={event => {
                event.preventDefault();
                handleSelect(option);
              }}
              onMouseEnter={() => {
                setActiveIndex(index);
              }}
              role="option"
              style={{
                backgroundColor:
                  index === activeIndex ? 'color-mix(in srgb, var(--color-text-primary) 8%, transparent)' : undefined,
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: '0.875rem',
                padding: '8px 12px',
              }}
            >
              {getOptionLabel(option)}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
