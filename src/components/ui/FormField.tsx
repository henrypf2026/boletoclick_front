'use client';

import { useField } from 'formik';
import { Checkbox } from 'flowbite-react';

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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-text">
        {label}
      </label>
      <input
        id={name}
        {...field}
        {...props}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-text placeholder:text-text-soft bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
          hasError
            ? 'border-red-500 focus:ring-red-500'
            : 'border-border focus:border-primary'
        }`}
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
    <div className="flex flex-col gap-1">
      <label
        htmlFor={name}
        className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-3 hover:bg-surface"
      >
        <Checkbox id={name} {...field} checked={field.value} className="mt-0.5 shrink-0" />
        <span className="text-sm text-text-soft">{label}</span>
      </label>
      {hasError && <p className="text-sm text-red-500">{meta.error}</p>}
    </div>
  );
}
