'use client';

import { Formik, Form, type FormikHelpers } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card } from 'flowbite-react';
import { FormCheckbox, FormTextInput } from '@/components/ui/FormField';
import { useAuth } from '@/context/AuthContext';
import { registerSchema } from '@/validators/authSchemas';

const initialValues = {
  name: '',
  email: '',
  birthDate: '',
  documentNumber: '',
  password: '',
  confirmPassword: '',
  allowNewsletter: false,
  acceptTerms: false,
};

export default function RegistroPage() {
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting, setStatus }: FormikHelpers<typeof initialValues>,
  ) => {
    setStatus(null);
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        birthDate: values.birthDate,
        documentNumber: values.documentNumber,
        allowNewsletter: values.allowNewsletter,
      });
      router.push('/');
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8 -mx-4 -my-8">
      <Card className="w-full max-w-md border-border bg-surface">
        <Link href="/" className="text-sm text-text-soft hover:text-text">
          ← Volver al inicio
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-text">Registrarme</h1>
        <p className="text-text-soft">
          Crea tu cuenta para acceder a preventas y comprar entradas.
        </p>

        <Formik initialValues={initialValues} validationSchema={registerSchema} onSubmit={handleSubmit}>
          {({ isSubmitting, status }) => (
            <Form className="mt-6 flex flex-col gap-4">
              <FormTextInput label="Nombre completo" name="name" type="text" placeholder="Juan Pérez" autoComplete="name" />
              <FormTextInput label="Correo electrónico" name="email" type="email" placeholder="tu@correo.com" autoComplete="email" />
              <FormTextInput label="Fecha de nacimiento" name="birthDate" type="date" autoComplete="bday" />
              <FormTextInput label="Número de documento" name="documentNumber" type="text" placeholder="DNI o pasaporte" />
              <FormTextInput label="Contraseña" name="password" type="password" placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
              <FormTextInput label="Confirmar contraseña" name="confirmPassword" type="password" placeholder="Repite tu contraseña" autoComplete="new-password" />
              <FormCheckbox name="allowNewsletter" label="Quiero recibir novedades y promociones de BoletoClick" />
              <FormCheckbox name="acceptTerms" label="Acepto los términos y condiciones de BoletoClick" />

              {status && <Alert color="failure">{status}</Alert>}

              <Button type="submit" disabled={isSubmitting} className="bg-primary text-background hover:bg-primary-deep">
                {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </Form>
          )}
        </Formik>

        <p className="mt-4 text-center text-sm text-text-soft">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
