import * as Yup from 'yup';

export const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email('Ingresa un correo válido')
    .required('El correo es obligatorio'),
  password: Yup.string().required('La contraseña es obligatoria'),
});

export const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email('Ingresa un correo válido')
    .required('El correo es obligatorio'),
});

export const updatePasswordSchema = Yup.object({
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es obligatoria'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirmá tu contraseña'),
});

const baseRegisterSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .required('El nombre es obligatorio'),
  email: Yup.string()
    .trim()
    .email('Ingresa un correo válido')
    .required('El correo es obligatorio'),
  birthDate: Yup.string().required('La fecha de nacimiento es obligatoria'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es obligatoria'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
  allowNewsletter: Yup.boolean().required(),
  acceptTerms: Yup.boolean()
    .oneOf([true], 'Debes aceptar los términos y condiciones')
    .required('Debes aceptar los términos y condiciones'),
});

export const userRegisterSchema = baseRegisterSchema.shape({
  documentNumber: Yup.string().trim(),
});

export const producerRegisterSchema = baseRegisterSchema.shape({
  documentNumber: Yup.string()
    .trim()
    .required('El número de documento es obligatorio'),
  businessName: Yup.string()
    .trim()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .required('El nombre de la empresa es obligatorio'),
});
