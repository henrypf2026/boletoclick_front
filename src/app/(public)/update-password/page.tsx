'use client';

import { useEffect, useState } from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card } from 'flowbite-react';
import { FormTextInput } from '@/components/ui/FormField';
import { supabase } from '@/lib/supabaseClient';
import { updatePasswordSchema } from '@/validators/authSchemas';

type Status = 'loading' | 'ready' | 'success' | 'invalid';

const initialValues = { password: '', confirmPassword: '' };

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    // Supabase redirige al usuario con un code en la URL (?code=xxx)
    // exchangeCodeForSession lo intercambia por una sesión activa automáticamente
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setStatus('ready');
      } else {
        // Intentamos detectar el code en la URL (flujo PKCE de Supabase)
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
          supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
            setStatus(error ? 'invalid' : 'ready');
          });
        } else {
          setStatus('invalid');
        }
      }
    });
  }, []);

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting, setFieldError }: FormikHelpers<typeof initialValues>,
  ) => {
    const { error } = await supabase.auth.updateUser({ password: values.password });
    setSubmitting(false);
    if (error) {
      setFieldError('password', error.message);
    } else {
      setStatus('success');
      setTimeout(() => router.push('/login'), 3000);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4 py-8 -mx-4 -my-8">
        <p className="text-text-soft">Verificando enlace...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8 -mx-4 -my-8">
      <Card className="w-full max-w-md border-border bg-surface">
        <h1 className="text-2xl font-bold text-text">Nueva contraseña</h1>

        {status === 'invalid' && (
          <Alert color="failure" className="mt-4">
            El link es inválido o ya expiró.{' '}
            <Link href="/forgot-password" className="font-medium underline">
              Solicitá uno nuevo
            </Link>
            .
          </Alert>
        )}

        {status === 'success' && (
          <Alert color="success" className="mt-4">
            Contraseña actualizada. Redirigiendo al inicio de sesión...
          </Alert>
        )}

        {status === 'ready' && (
          <Formik
            initialValues={initialValues}
            validationSchema={updatePasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors }) => (
              <Form className="mt-6 flex flex-col gap-4">
                <FormTextInput
                  label="Nueva contraseña"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <FormTextInput
                  label="Confirmar contraseña"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />

                {errors.password && (
                  <Alert color="failure">{errors.password}</Alert>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-background hover:bg-primary-deep"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar nueva contraseña'}
                </Button>
              </Form>
            )}
          </Formik>
        )}
      </Card>
    </div>
  );
}
