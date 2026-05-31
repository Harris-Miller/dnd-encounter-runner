import { Stack, TextField } from '@mui/material';
import type { ChangeEvent, FC } from 'react';

import type { CharacterFormValues } from './characterForm';

export interface CharacterFormFieldsProps {
  disabled?: boolean;
  onChange: (values: CharacterFormValues) => void;
  values: CharacterFormValues;
}

export const CharacterFormFields: FC<CharacterFormFieldsProps> = ({ disabled = false, onChange, values }) => {
  const handleFieldChange = (field: keyof CharacterFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
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
        onChange={handleFieldChange('level')}
        required
        slotProps={{ htmlInput: { min: 1 } }}
        type="number"
        value={values.level}
      />
      <TextField
        disabled={disabled}
        fullWidth
        label="Armor Class"
        onChange={handleFieldChange('armorClass')}
        required
        slotProps={{ htmlInput: { min: 0 } }}
        type="number"
        value={values.armorClass}
      />
      <TextField
        disabled={disabled}
        fullWidth
        label="Max Hit Points"
        onChange={handleFieldChange('maxHitPoints')}
        required
        slotProps={{ htmlInput: { min: 1 } }}
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
