import * as Yup from 'yup';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-]).+$/;
const PASSWORD_RULES = Yup.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .matches(
    PASSWORD_REGEX,
    'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
  )
  .required('La contraseña es obligatoria');

function isAdult(value: string | undefined): boolean {
  if (!value) return false;
  const birth = new Date(value);
  if (isNaN(birth.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 18;
}

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
  password: PASSWORD_RULES,
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
  birthDate: Yup.string()
    .required('La fecha de nacimiento es obligatoria')
    .test('is-adult', 'Debes ser mayor de 18 años para registrarte', isAdult),
  password: PASSWORD_RULES,
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
