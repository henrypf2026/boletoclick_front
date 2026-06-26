'use client';

import { Formik, Form } from 'formik';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardFormField } from '@/components/dashboard/DashboardFormField';
import { loginSchema } from '@/validators/authSchemas';
import type { AuthUser } from '@/services/authService';

interface ProducerScannerAuthProps {
  onAuthorized: () => void;
  eventTitle?: string;
}

type AuthStep = 'confirm' | 'credentials' | 'denied';

export default function ProducerScannerAuth({
  onAuthorized,
  eventTitle,
}: ProducerScannerAuthProps) {
  const { user, login } = useAuth();
  const [step, setStep] = useState<AuthStep>('confirm');
  const [authError, setAuthError] = useState<string | null>(null);

  if (step === 'denied') {
    return (
      <div className="border-2 border-text bg-background p-5 md:p-6 shadow-[4px_4px_0px_0px_var(--color-text)] space-y-4 text-center">
        <div className="text-4xl">🚫</div>
        <h3 className="text-sm font-black uppercase tracking-tight text-text">
          Acceso restringido
        </h3>
        <p className="text-xs font-mono text-text-soft leading-relaxed">
          Solo el productor del evento puede escanear boletos. Si sos staff de
          acceso, pedile al productor que inicie la sesión de escaneo.
        </p>
        <button
          type="button"
          onClick={() => setStep('confirm')}
          className="w-full border-2 border-text bg-surface py-2.5 font-mono text-xs font-black uppercase"
        >
          Volver
        </button>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="border-2 border-text bg-background p-5 md:p-6 shadow-[4px_4px_0px_0px_var(--color-text)] space-y-5">
        <div className="text-center space-y-2">
          <div className="text-4xl">🎫</div>
          <h3 className="text-base font-black uppercase tracking-tight text-text">
            ¿Sos el productor?
          </h3>
          <p className="text-xs font-mono text-text-soft leading-relaxed">
            Para escanear boletos desde el celular, confirmá que sos el
            productor del evento e ingresá tus credenciales.
          </p>
          {eventTitle && (
            <p className="text-[10px] font-mono font-bold uppercase text-primary truncate pt-1">
              {eventTitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setAuthError(null);
              setStep('credentials');
            }}
            className="w-full bg-primary text-background border-2 border-text py-3 font-mono text-xs font-black uppercase shadow-[3px_3px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            ✓ Sí, soy productor
          </button>
          <button
            type="button"
            onClick={() => setStep('denied')}
            className="w-full bg-surface border-2 border-text py-3 font-mono text-xs font-black uppercase hover:bg-surface-2 transition-colors"
          >
            ✕ No soy productor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-text bg-background p-5 md:p-6 shadow-[4px_4px_0px_0px_var(--color-text)] space-y-4">
      <div>
        <button
          type="button"
          onClick={() => {
            setAuthError(null);
            setStep('confirm');
          }}
          className="mb-3 text-[10px] font-mono font-bold uppercase text-text-soft hover:text-text"
        >
          ← Volver
        </button>
        <h3 className="text-sm font-black uppercase tracking-tight text-text">
          Credenciales del productor
        </h3>
        <p className="mt-2 text-xs font-mono text-text-soft leading-relaxed">
          Ingresá tu correo y contraseña para habilitar la cámara de escaneo.
        </p>
      </div>

      <Formik
        initialValues={{ email: user?.email ?? '', password: '' }}
        validationSchema={loginSchema}
        enableReinitialize
        onSubmit={async (values, helpers) => {
          setAuthError(null);
          helpers.setSubmitting(true);
          try {
            const account = (await login({
              email: values.email.trim(),
              password: values.password,
            })) as AuthUser;

            const role = account.role ?? account.user_role;
            if (role !== 'producer' && role !== 'admin') {
              throw new Error('Solo cuentas de productor pueden escanear boletos.');
            }

            if (
              user?.email &&
              account.email.toLowerCase() !== user.email.toLowerCase()
            ) {
              throw new Error(
                'Las credenciales no coinciden con la sesión activa del panel.',
              );
            }

            onAuthorized();
          } catch (error: unknown) {
            const message =
              error instanceof Error
                ? error.message
                : 'No se pudo verificar las credenciales.';
            setAuthError(message);
          } finally {
            helpers.setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <DashboardFormField
              label="Correo del productor"
              name="email"
              type="email"
              placeholder="productor@correo.com"
              className="normal-case"
            />
            <DashboardFormField
              label="Contraseña"
              name="password"
              type="password"
              placeholder="••••••••"
              className="normal-case"
            />

            {authError && (
              <p className="text-[10px] font-mono font-bold uppercase text-red-600 border-2 border-red-500 bg-red-500/10 p-3">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-background border-2 border-text py-3 font-mono text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
            >
              {isSubmitting ? '[ VERIFICANDO... ]' : '🔐 Iniciar escaneo'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
