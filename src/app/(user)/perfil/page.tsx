"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth  } from "@/context/AuthContext";
import { getToken } from "@/lib/auth";
import { saveToken } from "@/lib/auth";

interface ProfileFormValues {
  allowNewsletter: boolean;
}

async function uploadImage(file: File, userId: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/backend/files/uploadImage/${userId}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => "Error desconocido");
    throw new Error(msg || "Error al subir la imagen");
  }

 const data = await response.json();
  return data.profileImageUrl; 
}
export default function PerfilPage() {
  const { user, setUser } = useAuth();

  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.profileImageUrl ?? null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 400000) {
      setErrorMsg("La imagen supera el tamaño máximo de 400KB.");
      setSubmitStatus("error");
      return;
    }

    setErrorMsg("");
    setSubmitStatus(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const formik = useFormik<ProfileFormValues>({
    initialValues: {
      allowNewsletter: user?.allowNewsletter ?? false,
    },
    enableReinitialize: true, 
    validationSchema: Yup.object({
      allowNewsletter: Yup.boolean().required(),
    }),

    onSubmit: async (values, { setSubmitting }) => {
      if (!user) return;

      try {
        setSubmitStatus(null);
        setErrorMsg("");
      
        let finalImageUrl = user.profileImageUrl; 

        if (imageFile) {
          setUploadingImage(true);
          const uploadedUrl = await uploadImage(imageFile, user.id);
          console.log("Imagen subida a Cloudinary:", uploadedUrl);
          
          finalImageUrl = uploadedUrl; 
          setUploadingImage(false);
        }
        const token = getToken();
        const response = await fetch(`/api/backend/users/${user.id}`, {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ 
            allowNewsletter: values.allowNewsletter,
            profileImageUrl: finalImageUrl 
          }),
        });

      if (!response.ok) {
          const badData = await response.json().catch(() => null);
          const badMsg = badData?.message 
            ? (Array.isArray(badData.message) ? badData.message.join(", ") : badData.message)
            : "Error al actualizar perfil";
          throw new Error(badMsg);
        }
        const responseData = await response.json();
        console.log("Respuesta completa del servidor:", responseData);

        if (responseData.token) {
          saveToken(responseData.token, responseData.user?.role || user.role);
        }

        if (setUser) {
          setUser(responseData.user || responseData);
        }
        setSubmitStatus("success");
        setImageFile(null); 
        setTimeout(() => setSubmitStatus(null), 3500);

      } catch (error: unknown) {
        console.error(error);
        const msg = error instanceof Error ? error.message : "Error desconocido";
        setErrorMsg(msg);
        setSubmitStatus("error");
      } finally {
        setSubmitting(false);
        setUploadingImage(false);
      }
    },
  });

  const isLoading = formik.isSubmitting || uploadingImage;

  const getInitials = () => {
    if (!user) return "?";
    const name = user.name ?? user.email.split("@")[0];
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto min-h-screen bg-background text-text transition-colors">

      {/* Header */}
      <div className="mb-8 border-b-4 border-text pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
        <div>
          <h1 className="uppercase font-black text-3xl md:text-4xl tracking-tighter">
            Mi Perfil
          </h1>
          <p className="text-text-soft mt-1 font-mono text-xs uppercase tracking-wide">
            Configuración de cuenta y privacidad
          </p>
        </div>
        {user && (
          <div className="bg-surface border-2 border-text px-3 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_var(--color-text)]">
            {user.email}
          </div>
        )}
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="bg-surface border-2 border-text p-6 shadow-[4px_4px_0px_0px_var(--color-text)]">
          <h2 className="text-base font-black uppercase tracking-tight border-b-2 border-text pb-2 mb-5">
            Datos de la cuenta:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-text-soft mb-1 font-mono tracking-wider">
                Nombre
              </label>
              <input
                type="text"
                disabled
                value={user?.name ?? "—"}
                className="w-full bg-surface-2 border-2 border-text/40 text-text-soft/70 px-4 py-2.5 text-xs font-mono cursor-not-allowed focus:outline-none uppercase"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-text-soft mb-1 font-mono tracking-wider">
                Email
              </label>
              <input
                type="text"
                disabled
                value={user?.email ?? "—"}
                className="w-full bg-surface-2 border-2 border-text/40 text-text-soft/70 px-4 py-2.5 text-xs font-mono cursor-not-allowed focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-text-soft mb-1 font-mono tracking-wider">
                Rol
              </label>
              <input
                type="text"
                disabled
                value={user?.role ?? "—"}
                className="w-full bg-surface-2 border-2 border-text/40 text-text-soft/70 px-4 py-2.5 text-xs font-mono cursor-not-allowed focus:outline-none uppercase"
              />
            </div>
          </div>
        </div>

        <div className="bg-surface border-2 border-text p-6 shadow-[4px_4px_0px_0px_var(--color-text)]">
          <h2 className="text-base font-black uppercase tracking-tight border-b-2 border-text pb-2 mb-5">
             Foto de Perfil
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border-2 border-dashed border-text/40 bg-background/50">
            <div className="shrink-0">
              {imagePreview ? (
                <div className="w-24 h-24 border-4 border-text shadow-[3px_3px_0px_0px_var(--color-text)] overflow-hidden bg-surface">
                  <img
                    src={imagePreview}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 border-4 border-text bg-primary flex items-center justify-center shadow-[3px_3px_0px_0px_var(--color-text)]">
                  <span className="font-mono font-black text-2xl text-background">
                    {getInitials()}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2 text-center sm:text-left w-full">
              <label className="block text-[10px] font-black uppercase text-text font-mono tracking-wider">
                Subir nueva foto
              </label>
              <p className="text-[11px] text-text-soft font-mono uppercase">
                JPG, PNG, WEBP, GIF — Máx: <span className="font-black text-text">400KB</span>
              </p>
              <label
                htmlFor="profileImage"
                className="inline-block px-4 py-2 bg-surface-2 border-2 border-text font-mono text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-[2px_2px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
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
                <p className="font-mono text-[11px] text-text-soft mt-1 block">
                  ✔ {imageFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface border-2 border-text p-6 shadow-[4px_4px_0px_0px_var(--color-text)]">
          <h2 className="text-base font-black uppercase tracking-tight border-b-2 border-text pb-2 mb-5">
             Preferencias de Comunicación
          </h2>

          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative mt-0.5 shrink-0">
              <input
                id="allowNewsletter"
                type="checkbox"
                {...formik.getFieldProps("allowNewsletter")}
                checked={formik.values.allowNewsletter}
                className="sr-only"
              />
              <div
                onClick={() =>
                  formik.setFieldValue("allowNewsletter", !formik.values.allowNewsletter)
                }
                className={`w-6 h-6 border-2 border-text flex items-center justify-center transition-all cursor-pointer ${
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
              <p className="text-xs font-mono text-text-soft mt-1">
                Recibí novedades, eventos destacados y promociones exclusivas.
              </p>
            </div>
          </label>
        </div>

        {submitStatus === "success" && (
          <div className="border-2 border-success bg-success/10 p-4 font-mono text-xs font-bold uppercase text-success">
            ✅ Perfil actualizado correctamente
          </div>
        )}
        {submitStatus === "error" && (
          <div className="border-2 border-red-500 bg-red-500/10 p-4 font-mono text-xs font-bold uppercase text-red-500">
            ❌ {errorMsg || "Hubo un error al guardar. Intentá de nuevo."}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-background border-2 border-text font-mono font-black px-5 py-3 text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer w-full"
        >
          {isLoading
            ? uploadingImage
              ? "[ SUBIENDO IMAGEN A CLOUDINARY... ]"
              : "[ GUARDANDO... ]"
            : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}