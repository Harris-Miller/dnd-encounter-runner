import type { ChangeEvent, FC } from 'react';

import { Stack } from '../compat/Stack';
import { TextField } from '../compat/TextField';

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
    <Stack spacing={2}>
      <TextField
        disabled={disabled}
        fullWidth
        label="Name"
        onChange={handleFieldChange('name')}
        required
        value={values.name}
      />
      <TextField
        disabled={disabled}
        fullWidth
        label="Level"
        min={1}
        onChange={handleFieldChange('level')}
        required
        type="number"
        value={values.level}
      />
      <TextField
        disabled={disabled}
        fullWidth
        label="Armor Class"
        min={0}
        onChange={handleFieldChange('armorClass')}
        required
        type="number"
        value={values.armorClass}
      />
      <TextField
        disabled={disabled}
        fullWidth
        label="Max Hit Points"
        min={1}
        onChange={handleFieldChange('maxHitPoints')}
        required
        type="number"
        value={values.maxHitPoints}
      />
      <TextField
        disabled={disabled}
        fullWidth
        label="Notes"
        minRows={3}
        multiline
        onChange={handleFieldChange('notes')}
        value={values.notes}
      />
    </Stack>
  );
};
