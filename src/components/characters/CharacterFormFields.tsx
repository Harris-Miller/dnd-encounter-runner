import * as Label from '@radix-ui/react-label';
import type { ChangeEvent, FC } from 'react';

import type { CharacterFormValues } from './characterForm';

type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

export interface CharacterFormFieldsProps {
  disabled?: boolean;
  onChange: (values: CharacterFormValues) => void;
  values: CharacterFormValues;
}

export const CharacterFormFields: FC<CharacterFormFieldsProps> = ({ disabled = false, onChange, values }) => {
  const handleFieldChange = (field: keyof CharacterFormValues) => (event: FieldChangeEvent) => {
    onChange({ ...values, [field]: event.target.value });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="field">
        <Label.Root className="field-label" htmlFor="character-name">
          Name
        </Label.Root>
        <input
          className="field-input"
          disabled={disabled}
          id="character-name"
          onChange={handleFieldChange('name')}
          required
          value={values.name}
        />
      </div>
      <div className="field">
        <Label.Root className="field-label" htmlFor="character-level">
          Level
        </Label.Root>
        <input
          className="field-input"
          disabled={disabled}
          id="character-level"
          min={1}
          onChange={handleFieldChange('level')}
          required
          type="number"
          value={values.level}
        />
      </div>
      <div className="field">
        <Label.Root className="field-label" htmlFor="character-ac">
          Armor Class
        </Label.Root>
        <input
          className="field-input"
          disabled={disabled}
          id="character-ac"
          min={0}
          onChange={handleFieldChange('armorClass')}
          required
          type="number"
          value={values.armorClass}
        />
      </div>
      <div className="field">
        <Label.Root className="field-label" htmlFor="character-max-hp">
          Max Hit Points
        </Label.Root>
        <input
          className="field-input"
          disabled={disabled}
          id="character-max-hp"
          min={1}
          onChange={handleFieldChange('maxHitPoints')}
          required
          type="number"
          value={values.maxHitPoints}
        />
      </div>
      <div className="field">
        <Label.Root className="field-label" htmlFor="character-notes">
          Notes
        </Label.Root>
        <textarea
          className="field-input"
          disabled={disabled}
          id="character-notes"
          onChange={handleFieldChange('notes')}
          rows={3}
          value={values.notes}
        />
      </div>
    </div>
  );
};
