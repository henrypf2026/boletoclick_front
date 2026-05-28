'use client';

import { Suspense } from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Button, Card } from 'flowbite-react';
import { FormTextInput } from '@/components/ui/FormField';
import { useAuth } from '@/context/AuthContext';
import { loginSchema } from '@/validators/authSchemas';

const initialValues = { email: '', password: '' };

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('from') || '/';

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting, setStatus }: FormikHelpers<typeof initialValues>,
  ) => {
    setStatus(null);
    try {
      await login(values);
      router.push(redirectTo);
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-gray-800 bg-gray-900">
      <Link href="/" className="text-sm text-gray-400 hover:text-white">
        ← Volver al inicio
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Iniciar sesión</h1>
      <p className="text-gray-400">
        Ingresa con tu cuenta para comprar entradas y ver tus boletos.
      </p>

      <Formik initialValues={initialValues} validationSchema={loginSchema} onSubmit={handleSubmit}>
        {({ isSubmitting, status }) => (
          <Form className="mt-6 flex flex-col gap-4">
            <FormTextInput label="Correo electrónico" name="email" type="email" placeholder="tu@correo.com" autoComplete="email" />
            <FormTextInput label="Contraseña" name="password" type="password" placeholder="••••••••" autoComplete="current-password" />

            {status && <Alert color="failure">{status}</Alert>}

            <Button type="submit" disabled={isSubmitting} className="bg-brand text-gray-950 hover:bg-brand-dark">
              {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
            </Button>
          </Form>
        )}
      </Formik>

      <p className="mt-4 text-center text-sm text-gray-400">
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className="text-brand hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-950 px-4 py-8 -mx-4 -my-8">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
