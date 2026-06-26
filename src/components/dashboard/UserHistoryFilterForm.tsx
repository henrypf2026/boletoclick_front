'use client';

import { Formik, Form } from 'formik';
import {
  userHistoryFilterSchema,
  type UserHistoryFilterValues,
} from '@/validators/dashboardSchemas';

interface UserHistoryFilterFormProps {
  value: string;
  onChange: (query: string) => void;
}

export default function UserHistoryFilterForm({
  value,
  onChange,
}: UserHistoryFilterFormProps) {
  return (
    <Formik<UserHistoryFilterValues>
      initialValues={{ query: value }}
      validationSchema={userHistoryFilterSchema}
      enableReinitialize
      onSubmit={() => {}}
    >
      {({ values, handleChange, handleBlur, errors, touched }) => (
        <Form className="bg-surface border-2 border-text p-3 shadow-[2px_2px_0px_0px_var(--color-text)]">
          <input
            name="query"
            type="text"
            value={values.query}
            onChange={(event) => {
              handleChange(event);
              onChange(event.target.value);
            }}
            onBlur={handleBlur}
            placeholder="🔎 BUSCAR POR N° DE ORDEN O ESTADO..."
            className={`w-full bg-background border-2 border-text p-2 font-mono text-xs font-bold uppercase focus:outline-none ${
              touched.query && errors.query ? 'border-red-500' : ''
            }`}
          />
          {touched.query && errors.query && (
            <p className="mt-1 text-[10px] font-mono text-red-600">{errors.query}</p>
          )}
        </Form>
      )}
    </Formik>
  );
}
