'use client';

import { useState } from 'react';
import { useField } from 'formik';

interface FormTextInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  showStrength?: boolean;
}

interface FormCheckboxProps {
  label: string;
  name: string;
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

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1.5 text-sm font-medium text-red-700 dark:text-red-400">
      <AlertIcon />
      {message}
    </p>
  );
}

const PASSWORD_REQUIREMENTS = [
  { label: 'Mínimo 8 caracteres', test: (v: string) => v.length >= 8 },
  { label: 'Una mayúscula (A–Z)', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Una minúscula (a–z)', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Un número (0–9)', test: (v: string) => /\d/.test(v) },
  { label: 'Un carácter especial (!@#$...)', test: (v: string) => /[!@#$%^&*(),.?":{}|<>_\-]/.test(v) },
];

function PasswordStrength({ value }: { value: string }) {
  return (
    <ul className="mt-0.5 flex flex-col gap-1">
      {PASSWORD_REQUIREMENTS.map(({ label, test }) => {
        const met = value.length > 0 && test(value);
        return (
          <li
            key={label}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              !value
                ? 'text-text-soft'
                : met
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
            }`}
          >
            <span className="w-3 shrink-0 text-center leading-none">
              {!value ? '·' : met ? '✓' : '✗'}
            </span>
            {label}
          </li>
        );
      })}
    </ul>
  );
}

export function FormTextInput({ label, name, type, showStrength, ...props }: FormTextInputProps) {
  const [field, meta] = useField(name);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  // Show error as soon as the user types something (not only after blur)
  const hasError = Boolean(meta.error) && (meta.touched || (field.value?.length ?? 0) > 0);

  // Show strength checklist once the user starts typing or touches the field
  const showStrengthChecklist = showStrength && isPassword && (field.value?.length > 0 || meta.touched);

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
      {showStrengthChecklist ? (
        <PasswordStrength value={field.value ?? ''} />
      ) : (
        hasError && <FieldError message={meta.error!} />
      )}
    </div>
  );
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
        <input
          id={name}
          type="checkbox"
          {...field}
          checked={field.value}
          className="mt-0.5 shrink-0 size-4 accent-primary cursor-pointer"
        />
        <span className="text-sm text-text-soft">{label}</span>
      </label>
      {hasError && <FieldError message={meta.error!} />}
    </div>
  );
}
