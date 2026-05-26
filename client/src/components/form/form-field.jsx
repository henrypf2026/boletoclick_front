import { useField } from 'formik';
import { Label, TextInput, Checkbox } from 'flowbite-react';

export function FormTextInput({ label, name, ...props }) {
  const [field, meta] = useField(name);
  const hasError = meta.touched && meta.error;

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

export function FormCheckbox({ label, name }) {
  const [field, meta] = useField({ name, type: 'checkbox' });
  const hasError = meta.touched && meta.error;

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
