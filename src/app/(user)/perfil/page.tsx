"use client";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

interface ProfileFormValues {
  allowNewsletter: boolean;
}

const validationSchema = Yup.object({
  allowNewsletter: Yup.boolean().required(),
});


export default function PerfilPage() {
 
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  
 const uploadImage = async (file: File, userId: number): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `http://localhost:3000/files/uploadImage/${userId}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) throw new Error("Error al subir la imagen");

  const url = await response.text();
  return url;
};

  
  const formik = useFormik<ProfileFormValues>({
    initialValues: {
      // Acá idealmente se carga el valor real del usuario desde la API
      allowNewsletter: false,
    },
    validationSchema,

    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitStatus(null);
        setUploadingImage(true);

        // Obtenemos el token y el id del usuario logueado
        const token = localStorage.getItem("token");
        const meResponse = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = await meResponse.json();
        const userId = user.id;

        let profileImageUrl: string | null = null;
        if (imageFile) {
          profileImageUrl = await uploadImage(imageFile, userId);
        }

        setUploadingImage(false);

        const body: Record<string, unknown> = {
          allowNewsletter: values.allowNewsletter,
        };

        if (profileImageUrl) {
          body.profileImageUrl = profileImageUrl;
        }

        const response = await fetch(`http://localhost:3000/users/${userId}`, {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
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
    <div className="p-4 md:p-8 max-w-2xl mx-auto min-h-screen bg-background text-text">

     
      <div className="mb-8 border-b-4 border-text pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-text-soft">
            Configuración de cuenta
          </span>
        </div>
        <h1 className="uppercase tracking-tighter text-3xl md:text-4xl font-black">
          Mi Perfil
        </h1>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">

       
        <div className="bg-surface border-2 border-text p-6 shadow-[4px_4px_0px_0px_var(--color-text)] space-y-4">
          <h2 className="text-lg font-black uppercase border-b-2 border-text pb-2 tracking-tight">
            Foto de Perfil
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
           
            <div className="w-28 h-28 border-2 border-text bg-surface-2 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-[2px_2px_0px_0px_var(--color-text)]">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-mono text-xs text-text-soft uppercase text-center px-2">
                  Sin foto
                </span>
              )}
            </div>

          
            <div className="space-y-2 w-full">
              <label className="block text-xs font-black uppercase font-mono tracking-wide text-text-soft">
                Seleccioná una imagen (JPG, PNG)
              </label>

             
              <label
                htmlFor="profileImage"
                className="inline-block px-4 py-2.5 bg-surface-2 border-2 border-text font-mono text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-[2px_2px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
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
                <p className="font-mono text-xs text-text-soft mt-1">
                  ✔ {imageFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        
        <div className="bg-surface border-2 border-text p-6 shadow-[4px_4px_0px_0px_var(--color-text)] space-y-4">
          <h2 className="text-lg font-black uppercase border-b-2 border-text pb-2 tracking-tight">
            Preferencias de Comunicación
          </h2>

         
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                id="allowNewsletter"
                type="checkbox"
                {...formik.getFieldProps("allowNewsletter")}
                checked={formik.values.allowNewsletter}
                className="sr-only" // Ocultamos el checkbox nativo
              />
              
              <div
                className={`w-6 h-6 border-2 border-text flex items-center justify-center transition-all ${
                  formik.values.allowNewsletter
                    ? "bg-primary"
                    : "bg-surface-2"
                }`}
              >
                {formik.values.allowNewsletter && (
                  <span className="text-background font-black text-xs">✔</span>
                )}
              </div>
            </div>

            <div>
              <p className="font-black uppercase text-sm tracking-wide">
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
            ❌ Hubo un error al guardar. Intentá de nuevo.
          </div>
        )}

        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full neo-btn-interactive px-5 py-4 font-mono text-sm tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? uploadingImage
              ? "[ SUBIENDO IMAGEN... ]"
              : "[ GUARDANDO... ]"
            : "[ GUARDAR CAMBIOS ]"}
        </button>

      </form>
    </div>
  );
}
