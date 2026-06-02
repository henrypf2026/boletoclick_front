"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/lib/auth";

interface ProfileFormValues {
  allowNewsletter: boolean;
}

const validationSchema = Yup.object({
  allowNewsletter: Yup.boolean().required(),
});

async function uploadImage(file: File, userId: string, token: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/backend/files/uploadImage/${userId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) throw new Error("Error al subir la imagen");
  return response.text();
}

export default function PerfilPage() {
  const { user } = useAuth();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const formik = useFormik<ProfileFormValues>({
    initialValues: {
      allowNewsletter: false,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (!user) return;
      try {
        setSubmitStatus(null);
        setUploadingImage(true);

        const token = getToken();
        if (!token) throw new Error("Sin sesión activa");

        let profileImageUrl: string | null = null;
        if (imageFile) {
          profileImageUrl = await uploadImage(imageFile, user.id, token);
        }

        setUploadingImage(false);

        const body: Record<string, unknown> = {
          allowNewsletter: values.allowNewsletter,
        };
        if (profileImageUrl) body.profileImageUrl = profileImageUrl;

        const response = await fetch(`/api/backend/users/${user.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) throw new Error("Error al actualizar el perfil");
        setSubmitStatus("success");
      } catch (error) {
        console.error(error);
        setSubmitStatus("error");
      } finally {
        setSubmitting(false);
        setUploadingImage(false);
      }
    },
  });

  const isLoading = formik.isSubmitting || uploadingImage;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8 border-b-4 border-border pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 bg-primary animate-pulse" />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-text-soft">
            Configuración de cuenta
          </span>
        </div>
        <h1 className="uppercase tracking-tighter text-3xl md:text-4xl font-black text-text">
          Mi Perfil
        </h1>
        {user && (
          <p className="mt-1 text-sm text-text-soft">{user.email}</p>
        )}
      </div>

      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">

        {/* Foto de perfil */}
        <div className="bg-surface border-4 border-border p-6 shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col gap-4">
          <h2 className="text-base font-black uppercase tracking-tight text-text border-b-2 border-border pb-2">
            Foto de Perfil
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="size-28 shrink-0 border-4 border-border bg-surface-2 flex items-center justify-center overflow-hidden shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="font-mono text-xs font-black uppercase text-text-soft text-center px-2">
                  {user ? user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SIN FOTO'}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label className="text-[11px] font-black uppercase tracking-widest text-text-soft">
                Selecciona una imagen (JPG, PNG, WEBP)
              </label>
              <label
                htmlFor="profileImage"
                className="inline-flex items-center px-4 py-2.5 bg-surface-2 border-2 border-border font-mono text-xs font-black uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_0px_rgba(23,23,23,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all w-fit"
              >
                Elegir archivo
              </label>
              <input
                id="profileImage"
                type="file"
                accept=".jpg,.png,.jpeg,.gif,.webp"
                onChange={handleImageChange}
                className="hidden"
              />
              {imageFile && (
                <p className="font-mono text-xs text-text-soft">✔ {imageFile.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-surface border-4 border-border p-6 shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col gap-4">
          <h2 className="text-base font-black uppercase tracking-tight text-text border-b-2 border-border pb-2">
            Preferencias de comunicación
          </h2>
          <label className="flex items-start gap-4 cursor-pointer">
            <div className="relative mt-0.5 shrink-0">
              <input
                id="allowNewsletter"
                type="checkbox"
                {...formik.getFieldProps("allowNewsletter")}
                checked={formik.values.allowNewsletter}
                className="sr-only"
              />
              <div
                className={`size-6 border-2 border-border flex items-center justify-center transition-colors ${
                  formik.values.allowNewsletter ? "bg-primary" : "bg-surface-2"
                }`}
              >
                {formik.values.allowNewsletter && (
                  <span className="text-background font-black text-xs">✔</span>
                )}
              </div>
            </div>
            <div>
              <p className="font-black uppercase text-sm tracking-wide text-text">
                Suscribirme al boletín de noticias
              </p>
              <p className="text-xs text-text-soft mt-1">
                Recibe novedades, eventos destacados y promociones exclusivas.
              </p>
            </div>
          </label>
        </div>

        {/* Feedback */}
        {submitStatus === "success" && (
          <div className="border-2 border-success bg-success/10 p-4 text-xs font-bold uppercase tracking-wide text-success">
            ✅ Perfil actualizado correctamente
          </div>
        )}
        {submitStatus === "error" && (
          <div className="border-2 border-red-500 bg-red-500/10 p-4 text-xs font-bold uppercase tracking-wide text-red-500">
            ❌ Hubo un error al guardar. Intenta de nuevo.
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full border-4 border-border bg-primary py-4 font-mono text-sm font-black uppercase tracking-wider text-background shadow-[4px_4px_0px_0px_rgba(23,23,23,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? uploadingImage
              ? "Subiendo imagen..."
              : "Guardando..."
            : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
