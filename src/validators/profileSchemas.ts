import * as Yup from 'yup';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const userProfileSchema = Yup.object({
  allowNewsletter: Yup.boolean().required(),
  profileImageFile: Yup.mixed<File>()
    .nullable()
    .test(
      'fileSize',
      'La imagen supera el tamaño máximo de 2MB.',
      (file) => !file || file.size <= MAX_IMAGE_SIZE,
    )
    .test(
      'fileType',
      'Formato no permitido. Usá JPG, PNG, WEBP o GIF.',
      (file) => !file || ALLOWED_IMAGE_TYPES.includes(file.type),
    ),
});

export interface UserProfileFormValues {
  allowNewsletter: boolean;
  profileImageFile: File | null;
}
