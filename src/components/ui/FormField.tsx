'use client';

import { useState } from 'react';
import { useField } from 'formik';
import { Checkbox } from 'flowbite-react';

interface FormTextInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export function FormTextInput({ label, name, type, ...props }: FormTextInputProps) {
  const [field, meta] = useField(name);
  const [showPassword, setShowPassword] = useState(false);
  const hasError = meta.touched && Boolean(meta.error);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-text">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          {...field}
          {...props}
          type={inputType}
          className={`w-full rounded-lg border px-3 py-2.5 text-sm text-text placeholder:text-text-soft bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
            isPassword ? 'pr-10' : ''
          } ${
            hasError
              ? 'border-red-500 focus:ring-red-500'
              : 'border-border focus:border-primary'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-soft hover:text-text transition-colors"
          >
            <EyeIcon open={showPassword} />
          </button>
        )}
      </div>
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
