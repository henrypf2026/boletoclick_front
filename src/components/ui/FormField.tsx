'use client';

import { useField } from 'formik';
import { Label, TextInput, Checkbox } from 'flowbite-react';

interface FormTextInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

export function FormTextInput({ label, name, ...props }: FormTextInputProps) {
  const [field, meta] = useField(name);
  const hasError = meta.touched && Boolean(meta.error);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <TextInput
        id={name}
        {...field}
        {...props}
        color={hasError ? 'failure' : 'gray'}
      />
      {hasError && <p className="text-sm text-red-500">{meta.error}</p>}
    </div>
  );
}

interface FormCheckboxProps {
  label: string;
  name: string;
}

export function FormCheckbox({ label, name }: FormCheckboxProps) {
  const [field, meta] = useField({ name, type: 'checkbox' });
  const hasError = meta.touched && Boolean(meta.error);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <Checkbox id={name} {...field} checked={field.value} />
        <Label htmlFor={name} className="font-normal text-gray-400">
          {label}
        </Label>
      </div>
      {hasError && <p className="text-sm text-red-500">{meta.error}</p>}
    </div>
  );
}
