'use client';

import { useState } from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from 'flowbite-react';
import { FormAlert, FormCheckbox, FormTextInput } from '@/components/ui/FormField';
import { useAuth } from '@/context/AuthContext';
import { userRegisterSchema, producerRegisterSchema } from '@/validators/authSchemas';

type RegisterType = 'user' | 'producer';

const initialValues = {
  name: '',
  email: '',
  birthDate: '',
  documentNumber: '',
  businessName: '',
  password: '',
  confirmPassword: '',
  allowNewsletter: false,
  acceptTerms: false,
};

const producerBenefits = [
  'Crea y publica eventos con múltiples zonas y precios',
  'Gestiona el aforo y el stock de entradas en tiempo real',
  'Escanea y valida entradas en el acceso con tu celular',
  'Consulta reportes de ventas y recaudación por evento',
];

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [registerType, setRegisterType] = useState<RegisterType>('user');

  const isProducer = registerType === 'producer';
  const validationSchema = isProducer ? producerRegisterSchema : userRegisterSchema;

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting, setStatus }: FormikHelpers<typeof initialValues>,
  ) => {
    setStatus(null);
    try {
      const { confirmPassword, acceptTerms, businessName, ...rest } = values;
      await register({
        ...rest,
        ...(isProducer ? { role: 'producer', businessName } : {}),
      });
      router.push('/');
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Toggle comprador / productor */}
      <div className="mt-4 flex overflow-hidden border-2 border-border">
        <button
          type="button"
          onClick={() => setRegisterType('user')}
          className={`flex-1 py-2 text-sm font-black uppercase tracking-wide transition-colors ${
            !isProducer
              ? 'bg-primary text-background'
              : 'bg-surface text-text-soft hover:text-text'
          }`}
        >
          Comprador
        </button>
        <button
          type="button"
          onClick={() => setRegisterType('producer')}
          className={`flex-1 py-2 text-sm font-black uppercase tracking-wide transition-colors ${
            isProducer
              ? 'bg-primary text-background'
              : 'bg-surface text-text-soft hover:text-text'
          }`}
        >
          Productor
        </button>
      </div>

      <p className="mt-2 text-sm text-text-soft">
        {isProducer
          ? 'Regístrate como productor para crear y gestionar eventos.'
          : 'Crea tu cuenta para acceder a preventas y comprar entradas.'}
      </p>

      {/* Info bloque productor */}
      {isProducer && (
        <div className="mt-3 border-2 border-border bg-surface-2 p-4 shadow-[3px_3px_0px_0px_rgba(23,23,23,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
          <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-accent">
            ↗ ¿Qué puede hacer un productor?
          </p>
          <ul className="flex flex-col gap-2">
            {producerBenefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-text-soft">
                <span className="mt-0.5 shrink-0 text-xs font-black text-primary">✦</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, status }) => (
          <Form className="mt-4 flex flex-col gap-4">
            <FormTextInput label="Nombre completo" name="name" type="text" placeholder="Juan Pérez" autoComplete="name" />
            <FormTextInput label="Correo electrónico" name="email" type="email" placeholder="tu@correo.com" autoComplete="email" />
            <FormTextInput label="Fecha de nacimiento" name="birthDate" type="date" autoComplete="bday" />
            <FormTextInput label="Número de identificación" name="documentNumber" type="text" placeholder="INE, pasaporte o identificación oficial" />

            {isProducer && (
              <FormTextInput label="Nombre de la empresa" name="businessName" type="text" placeholder="Eventos S.A." />
            )}

            <FormTextInput label="Contraseña" name="password" type="password" placeholder="Creá tu contraseña" autoComplete="new-password" showStrength />
            <FormTextInput label="Confirmar contraseña" name="confirmPassword" type="password" placeholder="Repite tu contraseña" autoComplete="new-password" />
            <FormCheckbox name="allowNewsletter" label="Quiero recibir novedades y promociones de BoletoClick" />
            <FormCheckbox name="acceptTerms" label="Acepto los términos y condiciones de BoletoClick" />

            {status && <FormAlert message={status} />}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-background hover:bg-primary-deep"
            >
              {isSubmitting ? 'Creando cuenta...' : isProducer ? 'Crear cuenta de productor' : 'Crear cuenta'}
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
    </>
  );
}
