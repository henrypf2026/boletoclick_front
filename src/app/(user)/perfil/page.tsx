"use client";

import { authenticatedFetch } from '@/lib/authenticatedFetch';
import { useAuth } from "@/context/AuthContext";
import { saveToken } from "@/lib/auth";
import UserProfileForm from "@/components/profile/UserProfileForm";
import type { UserProfileFormValues } from "@/validators/profileSchemas";

async function uploadImage(file: File, userId: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await authenticatedFetch(`/api/backend/files/uploadImage/${userId}`, {
    method: "PUT",
    credentials: 'include',
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

  const handleSave = async (values: UserProfileFormValues) => {
    if (!user) return;

    let finalImageUrl = user.profileImageUrl;

    if (values.profileImageFile) {
      finalImageUrl = await uploadImage(values.profileImageFile, user.id);
    }

    const response = await authenticatedFetch(`/api/backend/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({
        allowNewsletter: values.allowNewsletter,
        profileImageUrl: finalImageUrl,
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

    if (responseData.user?.role) {
      saveToken(responseData.user.role);
    }

    if (setUser) {
      setUser(responseData.user || responseData);
    }
  };

  if (!user) {
    return (
      <div className="p-8 font-mono text-xs uppercase text-text-soft animate-pulse">
        [ Cargando perfil... ]
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto min-h-screen bg-background text-text transition-colors">
      <div className="mb-8 border-b-4 border-text pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
        <div>
          <h1 className="uppercase font-black text-3xl md:text-4xl tracking-tighter">
            Mi Perfil
          </h1>
          <p className="text-text-soft mt-1 font-mono text-xs uppercase tracking-wide">
            Configuración de cuenta y privacidad
          </p>
        </div>
        <div className="bg-surface border-2 border-text px-3 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_var(--color-text)]">
          {user.email}
        </div>
      </div>

      <UserProfileForm user={user} onSave={handleSave} />
    </div>
  );
}
