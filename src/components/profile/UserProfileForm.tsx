'use client';

import { useEffect, useState } from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import { DashboardFormCheckbox } from '@/components/dashboard/DashboardFormField';
import {
  userProfileSchema,
  type UserProfileFormValues,
} from '@/validators/profileSchemas';
import type { User } from '@/lib/auth';

interface UserProfileFormProps {
  user: User;
  onSave: (values: UserProfileFormValues) => Promise<void>;
}

function getInitials(user: User): string {
  const name = user.name ?? user.email.split('@')[0];
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function UserProfileForm({ user, onSave }: UserProfileFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    user.profileImageUrl ?? null,
  );

  useEffect(() => {
    if (user.profileImageUrl) {
      setImagePreview(user.profileImageUrl);
    }
  }, [user.profileImageUrl]);

  const handleSubmit = async (
    values: UserProfileFormValues,
    helpers: FormikHelpers<UserProfileFormValues>,
  ) => {
    helpers.setStatus(null);
    try {
      await onSave(values);
      helpers.setFieldValue('profileImageFile', null);
      helpers.setStatus('success');
      setTimeout(() => helpers.setStatus(null), 3500);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      helpers.setStatus({ type: 'error', message });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <Formik<UserProfileFormValues>
      initialValues={{
        allowNewsletter: user.allowNewsletter ?? false,
        profileImageFile: null,
      }}
      validationSchema={userProfileSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({
        values,
        isSubmitting,
        setFieldValue,
        setFieldTouched,
        errors,
        touched,
        status,
      }) => (
        <Form className="space-y-6">
          <div className="bg-surface border-2 border-text p-6 shadow-[4px_4px_0px_0px_var(--color-text)]">
            <h2 className="text-base font-black uppercase tracking-tight border-b-2 border-text pb-2 mb-5">
              Datos de la cuenta:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-text-soft mb-1 font-mono tracking-wider">
                  Nombre
                </label>
                <input
                  type="text"
                  disabled
                  readOnly
                  value={user.name ?? '—'}
                  className="w-full bg-surface-2 border-2 border-text/40 text-text-soft/70 px-4 py-2.5 text-xs font-mono cursor-not-allowed focus:outline-none uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-text-soft mb-1 font-mono tracking-wider">
                  Email
                </label>
                <input
                  type="text"
                  disabled
                  readOnly
                  value={user.email}
                  className="w-full bg-surface-2 border-2 border-text/40 text-text-soft/70 px-4 py-2.5 text-xs font-mono cursor-not-allowed focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-text-soft mb-1 font-mono tracking-wider">
                  Rol
                </label>
                <input
                  type="text"
                  disabled
                  readOnly
                  value={user.role ?? '—'}
                  className="w-full bg-surface-2 border-2 border-text/40 text-text-soft/70 px-4 py-2.5 text-xs font-mono cursor-not-allowed focus:outline-none uppercase"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface border-2 border-text p-6 shadow-[4px_4px_0px_0px_var(--color-text)]">
            <h2 className="text-base font-black uppercase tracking-tight border-b-2 border-text pb-2 mb-5">
              Foto de Perfil
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border-2 border-dashed border-text/40 bg-background/50">
              <div className="shrink-0">
                {imagePreview ? (
                  <div className="w-24 h-24 border-4 border-text shadow-[3px_3px_0px_0px_var(--color-text)] overflow-hidden bg-surface">
                    <img
                      src={imagePreview}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 border-4 border-text bg-primary flex items-center justify-center shadow-[3px_3px_0px_0px_var(--color-text)]">
                    <span className="font-mono font-black text-2xl text-background">
                      {getInitials(user)}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left w-full">
                <label
                  htmlFor="profileImageFile"
                  className="block text-[10px] font-black uppercase text-text font-mono tracking-wider"
                >
                  Subir nueva foto
                </label>
                <p className="text-[11px] text-text-soft font-mono uppercase">
                  JPG, PNG, WEBP, GIF — Máx:{' '}
                  <span className="font-black text-text">2MB</span>
                </p>
                <label
                  htmlFor="profileImageFile"
                  className="inline-block px-4 py-2 bg-surface-2 border-2 border-text font-mono text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-[2px_2px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  Elegir archivo
                </label>
                <input
                  id="profileImageFile"
                  name="profileImageFile"
                  type="file"
                  accept=".jpg,.png,.jpeg,.gif,.webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0] ?? null;
                    void setFieldValue('profileImageFile', file);
                    void setFieldTouched('profileImageFile', true, false);

                    if (file) {
                      setImagePreview(URL.createObjectURL(file));
                    } else if (user.profileImageUrl) {
                      setImagePreview(user.profileImageUrl);
                    } else {
                      setImagePreview(null);
                    }
                  }}
                  onBlur={() => {
                    void setFieldTouched('profileImageFile', true);
                  }}
                />
                {values.profileImageFile && (
                  <p className="font-mono text-[11px] text-text-soft mt-1 block">
                    ✔ {values.profileImageFile.name}
                  </p>
                )}
                {touched.profileImageFile && errors.profileImageFile && (
                  <p className="text-[10px] font-mono text-red-600">
                    {errors.profileImageFile}
                  </p>
                )}
              </div>
            </div>
          </div>

          {status === 'success' && (
            <div className="border-2 border-success bg-success/10 p-4 font-mono text-xs font-bold uppercase text-success">
              ✅ Perfil actualizado correctamente
            </div>
          )}
          {status?.type === 'error' && (
            <div className="border-2 border-red-500 bg-red-500/10 p-4 font-mono text-xs font-bold uppercase text-red-500">
              ❌ {status.message}
            </div>
          )}

          <div className="bg-surface border-2 border-text p-6 shadow-[4px_4px_0px_0px_var(--color-text)]">
            <h2 className="text-base font-black uppercase tracking-tight border-b-2 border-text pb-2 mb-5">
              Preferencias de Comunicación
            </h2>
            <DashboardFormCheckbox
              name="allowNewsletter"
              title="Suscribirme al boletín de noticias"
              description="Recibí novedades, eventos destacados y promociones exclusivas."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-background border-2 border-text font-mono font-black px-5 py-3 text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer w-full"
          >
            {isSubmitting ? '[ GUARDANDO... ]' : 'Guardar Cambios'}
          </button>
        </Form>
      )}
    </Formik>
  );
}
