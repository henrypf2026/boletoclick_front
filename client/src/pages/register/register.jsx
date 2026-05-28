import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Label, TextInput } from 'flowbite-react';
import { FormCheckbox, FormTextInput } from '../../components/form/form-field';
import { useAuth } from '../../context/AuthContext';
import {
  registerSchema,
  verifyCodeSchema,
} from '../../utils/validation/authSchemas';

const registerInitialValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};

const verifyInitialValues = {
  verificationCode: '',
};

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('form');
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleRegisterSubmit = (values) => {
    setSubmitError('');
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedCode(code);
    setPendingRegistration(values);
    setStep('verify');
  };

  const handleVerifySubmit = async (values, { setSubmitting, setStatus }) => {
    setStatus(null);
    setSubmitError('');

    if (values.verificationCode.trim() !== generatedCode) {
      setStatus('Código de verificación incorrecto.');
      setSubmitting(false);
      return;
    }

    try {
      await register({
        name: pendingRegistration.name,
        email: pendingRegistration.email,
        password: pendingRegistration.password,
      });
      navigate('/');
    } catch (error) {
      setSubmitError(error.message);
      setStep('form');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-950 px-4 py-8">
      <Card className="w-full max-w-md border-gray-800 bg-gray-900">
        <Link to="/" className="text-sm text-gray-400 hover:text-white">
          ← Volver al inicio
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">Registrarme</h1>
        <p className="text-gray-400">
          Crea tu cuenta para acceder a preventas y comprar entradas.
        </p>

        {step === 'form' ? (
          <Formik
            initialValues={registerInitialValues}
            validationSchema={registerSchema}
            onSubmit={handleRegisterSubmit}
          >
            {() => (
              <Form className="mt-6 flex flex-col gap-4">
                <FormTextInput
                  label="Nombre completo"
                  name="name"
                  type="text"
                  placeholder="Juan Pérez"
                  autoComplete="name"
                />
                <FormTextInput
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                />
                <FormTextInput
                  label="Contraseña"
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
                <FormCheckbox
                  name="acceptTerms"
                  label="Acepto los términos y condiciones de BoletoClick"
                />

                {submitError && <Alert color="failure">{submitError}</Alert>}

                <Button type="submit" className="bg-brand text-gray-950 hover:bg-brand-dark">
                  Continuar
                </Button>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={verifyInitialValues}
            validationSchema={verifyCodeSchema}
            onSubmit={handleVerifySubmit}
          >
            {({ isSubmitting, status }) => (
              <Form className="mt-6 flex flex-col gap-4">
                <Alert color="info">
                  Te enviamos un código de verificación simulado:{' '}
                  <strong>{generatedCode}</strong>
                </Alert>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="verificationCode">Código de verificación</Label>
                  <Field
                    as={TextInput}
                    id="verificationCode"
                    name="verificationCode"
                    placeholder="000000"
                    maxLength={6}
                    inputMode="numeric"
                  />
                  <ErrorMessage
                    name="verificationCode"
                    component="p"
                    className="text-sm text-red-500"
                  />
                </div>

                {(status || submitError) && (
                  <Alert color="failure">{status || submitError}</Alert>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand text-gray-950 hover:bg-brand-dark"
                >
                  {isSubmitting ? 'Creando cuenta...' : 'Verificar y registrarme'}
                </Button>

                <Button color="gray" outline type="button" onClick={() => setStep('form')}>
                  Volver al formulario
                </Button>
              </Form>
            )}
          </Formik>
        )}

        <p className="mt-4 text-center text-sm text-gray-400">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-brand hover:underline">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default Register;
