import { Flex, Text, TextArea, TextField } from '@radix-ui/themes';
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
    <Flex direction="column" gap="4">
      <Flex direction="column" gap="1">
        <Text as="label" htmlFor="character-name" size="2" weight="medium">
          Name
        </Text>
        <TextField.Root
          disabled={disabled}
          id="character-name"
          onChange={handleFieldChange('name')}
          required
          value={values.name}
        />
      </Flex>
      <Flex direction="column" gap="1">
        <Text as="label" htmlFor="character-level" size="2" weight="medium">
          Level
        </Text>
        <TextField.Root
          disabled={disabled}
          id="character-level"
          min={1}
          onChange={handleFieldChange('level')}
          required
          type="number"
          value={values.level}
        />
      </Flex>
      <Flex direction="column" gap="1">
        <Text as="label" htmlFor="character-ac" size="2" weight="medium">
          Armor Class
        </Text>
        <TextField.Root
          disabled={disabled}
          id="character-ac"
          min={0}
          onChange={handleFieldChange('armorClass')}
          required
          type="number"
          value={values.armorClass}
        />
      </Flex>
      <Flex direction="column" gap="1">
        <Text as="label" htmlFor="character-max-hp" size="2" weight="medium">
          Max Hit Points
        </Text>
        <TextField.Root
          disabled={disabled}
          id="character-max-hp"
          min={1}
          onChange={handleFieldChange('maxHitPoints')}
          required
          type="number"
          value={values.maxHitPoints}
        />
      </Flex>
      <Flex direction="column" gap="1">
        <Text as="label" htmlFor="character-notes" size="2" weight="medium">
          Notes
        </Text>
        <TextArea
          disabled={disabled}
          id="character-notes"
          onChange={handleFieldChange('notes')}
          rows={3}
          value={values.notes}
        />
      </Flex>
    </Flex>
  );
};
