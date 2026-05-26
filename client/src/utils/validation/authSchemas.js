import * as Yup from 'yup';

export const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email('Ingresa un correo válido')
    .required('El correo es obligatorio'),
  password: Yup.string().required('La contraseña es obligatoria'),
});

export const registerSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .required('El nombre es obligatorio'),
  email: Yup.string()
    .trim()
    .email('Ingresa un correo válido')
    .required('El correo es obligatorio'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es obligatoria'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
  acceptTerms: Yup.boolean()
    .oneOf([true], 'Debes aceptar los términos y condiciones')
    .required('Debes aceptar los términos y condiciones'),
});

export const verifyCodeSchema = Yup.object({
  verificationCode: Yup.string()
    .matches(/^\d{6}$/, 'El código debe tener 6 dígitos')
    .required('Ingresa el código de verificación'),
});
