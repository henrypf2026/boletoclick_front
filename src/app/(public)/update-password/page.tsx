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
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type = hashParams.get('type');

    if (type === 'recovery' && accessToken && refreshToken) {
      // Flujo implícito: tokens vienen en el hash de la URL
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => setStatus(error ? 'invalid' : 'ready'));
      return;
    }

    // Flujo PKCE: code viene como query param
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(({ error }) => setStatus(error ? 'invalid' : 'ready'));
      return;
    }

    setStatus('invalid');
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
            {({ isSubmitting }) => (
              <Form className="mt-6 flex flex-col gap-4">
                <FormTextInput
                  label="Nueva contraseña"
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
                <FormTextInput
                  label="Confirmar contraseña"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                />
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
