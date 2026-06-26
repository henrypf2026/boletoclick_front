'use client';

import { useField } from 'formik';

interface DashboardFormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  step?: string;
  style?: React.CSSProperties;
  className?: string;
  hideLabel?: boolean;
}

export function DashboardFormField({
  label,
  name,
  type = 'text',
  placeholder,
  disabled,
  min,
  step,
  style,
  className = '',
  hideLabel = false,
}: DashboardFormFieldProps) {
  const [field, meta] = useField(name);
  const hasError = Boolean(meta.error) && (meta.touched || String(field.value ?? '').length > 0);

  return (
    <div className={hideLabel ? '' : 'space-y-1'}>
      {!hideLabel && (
        <label htmlFor={name} className="text-[10px] font-mono font-bold uppercase text-text-soft">
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        step={step}
        style={style}
        {...field}
        className={`w-full border-2 border-text p-2 bg-background font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none disabled:opacity-50 disabled:bg-surface ${hasError ? 'border-red-500' : ''} ${className}`}
      />
      {hasError && (
        <p className="text-[10px] font-mono text-red-600">{meta.error}</p>
      )}
    </div>
  );
}

interface DashboardFormSelectProps {
  label: string;
  name: string;
  disabled?: boolean;
  placeholder?: string;
  children: React.ReactNode;
}

export function DashboardFormSelect({
  label,
  name,
  disabled,
  placeholder,
  children,
}: DashboardFormSelectProps) {
  const [field, meta] = useField(name);
  const hasError = Boolean(meta.error) && (meta.touched || String(field.value ?? '').length > 0);

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-[10px] font-mono font-bold uppercase text-text-soft">
        {label}
      </label>
      <select
        id={name}
        disabled={disabled}
        {...field}
        className={`w-full border-2 border-text p-2 bg-background font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none disabled:opacity-50 ${hasError ? 'border-red-500' : ''}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      {hasError && (
        <p className="text-[10px] font-mono text-red-600">{meta.error}</p>
      )}
    </div>
  );
}

interface DashboardFormTextareaProps {
  label: string;
  name: string;
  rows?: number;
}

export function DashboardFormTextarea({ label, name, rows = 3 }: DashboardFormTextareaProps) {
  const [field, meta] = useField(name);
  const hasError = Boolean(meta.error) && (meta.touched || String(field.value ?? '').length > 0);

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-[10px] font-mono font-bold uppercase text-text-soft">
        {label}
      </label>
      <textarea
        id={name}
        rows={rows}
        {...field}
        className={`w-full border-2 border-text p-2 bg-background font-medium text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none resize-none ${hasError ? 'border-red-500' : ''}`}
      />
      {hasError && (
        <p className="text-[10px] font-mono text-red-600">{meta.error}</p>
      )}
    </div>
  );
}

interface DashboardFormCheckboxProps {
  name: string;
  title: string;
  description: string;
}

export function DashboardFormCheckbox({ name, title, description }: DashboardFormCheckboxProps) {
  const [field, meta] = useField({ name, type: 'checkbox' });
  const hasError = Boolean(meta.error) && meta.touched;

  return (
    <div>
      <label htmlFor={name} className="flex items-start gap-4 cursor-pointer group">
        <div className="relative mt-0.5 shrink-0">
          <input
            id={name}
            type="checkbox"
            {...field}
            checked={Boolean(field.value)}
            className="sr-only"
          />
          <div
            className={`w-6 h-6 border-2 border-text flex items-center justify-center transition-all cursor-pointer ${
              field.value ? 'bg-primary' : 'bg-surface-2'
            } ${hasError ? 'border-red-500' : ''}`}
          >
            {field.value && (
              <span className="text-background font-black text-xs">✔</span>
            )}
          </div>
        </div>
        <div>
          <p className="font-black uppercase text-sm tracking-wide text-text">{title}</p>
          <p className="text-xs font-mono text-text-soft mt-1">{description}</p>
        </div>
      </label>
      {hasError && (
        <p className="mt-1 text-[10px] font-mono text-red-600">{meta.error}</p>
      )}
    </div>
  );
}
