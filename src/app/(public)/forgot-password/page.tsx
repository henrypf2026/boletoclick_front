'use client';

import { useState } from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import Link from 'next/link';
import { Alert, Button, Card } from 'flowbite-react';
import { FormTextInput } from '@/components/ui/FormField';
import { authService } from '@/services/authService';
import { forgotPasswordSchema } from '@/validators/authSchemas';

const initialValues = { email: '' };

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting, setStatus }: FormikHelpers<typeof initialValues>,
  ) => {
    setStatus(null);
    try {
      await authService.forgotPassword(values.email);
      setSent(true);
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8 -mx-4 -my-8">
      <Card className="w-full max-w-md border-border bg-surface">
        <Link href="/login" className="text-sm text-text-soft hover:text-text">
          ← Volver al inicio de sesión
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-text">Recuperar contraseña</h1>
        <p className="text-text-soft">
          Ingresá tu correo y te enviamos un link para restablecer tu contraseña.
        </p>

        {sent ? (
          <Alert color="success" className="mt-4">
            Si el correo está registrado, vas a recibir un link en tu bandeja de entrada.
            Revisá también la carpeta de spam.
          </Alert>
        ) : (
          <Formik
            initialValues={initialValues}
            validationSchema={forgotPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, status }) => (
              <Form className="mt-6 flex flex-col gap-4">
                <FormTextInput
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                />

                {status && <Alert color="failure">{status}</Alert>}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-background hover:bg-primary-deep"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar link de recuperación'}
                </Button>
              </Form>
            )}
          </Formik>
        )}
      </Card>
    </div>
  );
}
