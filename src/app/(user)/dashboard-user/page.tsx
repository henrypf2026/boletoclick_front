"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Ticket {
  id: string;
  evento: string;
  fecha: string;
  zona: string;
  qr: string;
}

interface Tarjeta {
  id: string;
  tipo: "Crédito" | "Débito";
  marca: string;
  ultimosCuatro: string;
}

interface ProfileFormValues {
  nombreTitular: string;
  dni: string;
  telefono: string;
  passwordActual: string;
  passwordNueva: string;
  allowNewsletter: boolean;
}

const validationSchema = Yup.object({
  nombreTitular: Yup.string().required("Requerido"),
  dni: Yup.string()
    .matches(/^\d+$/, "Solo números")
    .min(7, "Mínimo 7 dígitos")
    .max(8, "Máximo 8 dígitos")
    .required("Requerido"),
  telefono: Yup.string().matches(/^\d+$/, "Solo números").required("Requerido"),
  passwordActual: Yup.string(),
  passwordNueva: Yup.string().min(6, "Mínimo 6 caracteres"),
  allowNewsletter: Yup.boolean().required(),
});

export default function UserDashboard() {
  const [seccionActiva, setSeccionActiva] = useState<
    "entradas" | "historial" | "perfil"
  >("entradas");
  const [ticketExpandido, setTicketExpandido] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para manejo de archivos e imágenes
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null,
  );

  // Métodos de pago locales
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([
    {
      id: "card-1",
      tipo: "Débito",
      marca: "Visa Débito",
      ultimosCuatro: "4321",
    },
    {
      id: "card-2",
      tipo: "Crédito",
      marca: "Mastercard",
      ultimosCuatro: "8812",
    },
  ]);
  const [nuevaTarjetaNumero, setNuevaTarjetaNumero] = useState("");
  const [nuevaTarjetaTipo, setNuevaTarjetaTipo] = useState<
    "Crédito" | "Débito"
  >("Débito");
  const [filtroHistorial, setFiltroHistorial] = useState("");

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [seccionActiva]);

  const tickets: Ticket[] = [
    {
      id: "TK-992",
      evento: "DUKI - RIVER",
      fecha: "28 MAY 2026",
      zona: "CAMPO VIP",
      qr: "QR-DK-992",
    },
    {
      id: "TK-110",
      evento: "BABASONICOS - MOVISTAR ARENA",
      fecha: "15 JUN 2026",
      zona: "PLATEA ALTA",
      qr: "QR-BS-110",
    },
  ];

  const compras = [
    {
      id: "FAC-9843",
      fecha: "20 May 2026",
      evento: "Duki - RIVER",
      entradas: 2,
      total: 44000,
      metodo: "Visa Débito",
    },
    {
      id: "FAC-8211",
      fecha: "12 Abr 2026",
      evento: "Conociendo Rusia",
      entradas: 1,
      total: 15000,
      metodo: "Mastercard",
    },
  ];

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
      },
    );

    if (!response.ok) throw new Error("Error al subir la imagen");
    return await response.text();
  };

  const formik = useFormik<ProfileFormValues>({
    initialValues: {
      nombreTitular: "JUAN PEREZ",
      dni: "40123456",
      telefono: "1123456789",
      passwordActual: "",
      passwordNueva: "",
      allowNewsletter: false,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setSubmitStatus(null);
        setUploadingImage(true);

        const token = localStorage.getItem("token");
        const meResponse = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!meResponse.ok) throw new Error("Error al autenticar usuario");
        const user = await meResponse.json();
        const userId = user.id;

        let profileImageUrl: string | null = null;
        if (imageFile) {
          profileImageUrl = await uploadImage(imageFile, userId);
        }

        setUploadingImage(false);

        const body: Record<string, unknown> = {
          nombreTitular: values.nombreTitular,
          dni: values.dni,
          telefono: values.telefono,
          allowNewsletter: values.allowNewsletter,
        };

        if (profileImageUrl) {
          body.profileImageUrl = profileImageUrl;
        }

        if (values.passwordNueva) {
          body.passwordActual = values.passwordActual;
          body.passwordNueva = values.passwordNueva;
        }

        const response = await fetch(`http://localhost:3000/users/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) throw new Error("Error al actualizar el perfil");

        setSubmitStatus("success");
        resetForm({
          values: { ...values, passwordActual: "", passwordNueva: "" },
        });
        setTimeout(() => setSubmitStatus(null), 3500);
      } catch (error) {
        console.error(error);
        setSubmitStatus("error");
      } finally {
        setSubmitting(false);
        setUploadingImage(false);
      }
    },
  });

  const isProfileLoading = formik.isSubmitting || uploadingImage;

  const handleAgregarTarjeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaTarjetaNumero.length < 4) return;

    const ultimos = nuevaTarjetaNumero.slice(-4);
    const marca = nuevaTarjetaNumero.startsWith("4") ? "Visa" : "Mastercard";

    const nueva: Tarjeta = {
      id: `card-${Date.now()}`,
      tipo: nuevaTarjetaTipo,
      marca: `${marca} ${nuevaTarjetaTipo}`,
      ultimosCuatro: ultimos,
    };

    setTarjetas([...tarjetas, nueva]);
    setNuevaTarjetaNumero("");
  };

  const handleEliminarTarjeta = (id: string) => {
    setTarjetas(tarjetas.filter((t) => t.id !== id));
  };

  const comprasFiltradas = compras.filter(
    (c) =>
      c.evento.toLowerCase().includes(filtroHistorial.toLowerCase()) ||
      c.id.toLowerCase().includes(filtroHistorial.toLowerCase()),
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen bg-background text-text transition-colors">
      {/* Header Dashboard */}
      <div className="mb-8 border-b-4 border-text pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
        <div>
          <h1 className="uppercase font-black text-3xl md:text-4xl tracking-tighter">
            Mi Cuenta
          </h1>
          <p className="text-text-soft mt-1 font-mono text-xs uppercase tracking-wide">
            Gestioná tus accesos, compras y datos de perfil
          </p>
        </div>
        <div className="bg-surface border-2 border-text px-3 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_var(--color-text)]">
          ESTADO: <span className="text-success animate-pulse">● En Línea</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-text mb-6 gap-2 overflow-x-auto pb-0">
        {(
          [
            { id: "entradas", label: "🎟️ MIS ENTRADAS" },
            { id: "historial", label: "📜 HISTORIAL DE COMPRAS" },
            { id: "perfil", label: "👤 MI PERFIL" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSeccionActiva(tab.id)}
            className={`pb-3 px-4 font-black text-xs tracking-wider transition-all whitespace-nowrap cursor-pointer border-t-2 border-x-2 ${
              seccionActiva === tab.id
                ? "bg-text text-surface border-text translate-y-0.5"
                : "border-transparent text-text-soft hover:text-text bg-surface/40"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-surface border-2 border-text w-full"></div>
          <div className="h-32 bg-surface border-2 border-text w-full"></div>
        </div>
      ) : (
        <>
          {/* SECCIÓN: ENTRADAS */}
          {seccionActiva === "entradas" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setTicketExpandido(ticket)}
                  className="bg-surface border-2 border-text rounded-none shadow-[4px_4px_0px_0px_var(--color-text)] p-5 flex flex-col justify-between transition-all hover:shadow-[7px_7px_0px_0px_var(--color-text)] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer group"
                >
                  <div className="border-b-2 border-dashed border-text/40 pb-4 mb-4 relative">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-text font-black text-lg uppercase tracking-tight group-hover:text-primary transition-colors">
                        {ticket.evento}
                      </h3>
                      <span className="text-[9px] font-mono bg-text text-surface px-1.5 py-0.5 font-bold whitespace-nowrap">
                        VER ACCESO
                      </span>
                    </div>
                    <p className="text-primary-deep dark:text-primary font-black mt-2 font-mono text-sm">
                      {ticket.fecha}
                    </p>
                    <p className="text-text-soft mt-2 text-[11px] uppercase font-bold tracking-wider">
                      SECTOR:{" "}
                      <span className="text-text font-black font-mono bg-surface-2 px-2 py-0.5 border border-text/20">
                        {ticket.zona}
                      </span>
                    </p>
                  </div>
                  <div className="bg-surface-2 p-3 border-2 border-text flex flex-col items-center justify-center max-w-40 mx-auto w-full transition-transform group-hover:scale-105">
                    <div className="w-full py-3 bg-black text-white flex items-center justify-center font-mono text-[10px] uppercase font-black tracking-widest">
                      [ SCAN CODE ]
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECCIÓN: HISTORIAL */}
          {seccionActiva === "historial" && (
            <div className="space-y-4">
              <div className="bg-surface border-2 border-text p-3 shadow-[2px_2px_0px_0px_var(--color-text)]">
                <input
                  type="text"
                  placeholder="🔎 BUSCAR COMPRA POR EVENTO O FACTURA..."
                  value={filtroHistorial}
                  onChange={(e) => setFiltroHistorial(e.target.value)}
                  className="w-full bg-background border-2 border-text p-2 font-mono text-xs font-bold uppercase focus:outline-none"
                />
              </div>

              <div className="bg-surface border-2 border-text rounded-none shadow-[4px_4px_0px_0px_var(--color-text)] divide-y-2 divide-text">
                {comprasFiltradas.length > 0 ? (
                  comprasFiltradas.map((compra) => (
                    <div
                      key={compra.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono bg-text text-surface px-2 py-0.5 font-bold text-[10px]">
                            {compra.id}
                          </span>
                          <span className="text-text-soft text-xs font-mono font-bold">
                            {compra.fecha}
                          </span>
                        </div>
                        <h3 className="text-text text-base font-black uppercase tracking-tight">
                          {compra.evento}
                        </h3>
                        <p className="text-text-soft text-xs font-mono mt-0.5">
                          Entradas: {compra.entradas} | Pago: {compra.metodo}
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-text/20">
                        <div className="sm:text-right">
                          <span className="text-text-soft text-[10px] block uppercase font-mono font-bold">
                            TOTAL ABONADO
                          </span>
                          <span className="font-black text-lg font-mono text-text">
                            ${compra.total.toLocaleString("es-AR")}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            alert(
                              `Simulación: Descargando PDF de la factura ${compra.id}...`,
                            )
                          }
                          className="bg-primary hover:brightness-105 text-background font-mono font-black text-xs uppercase tracking-wider transition-all border-2 border-text px-4 py-2 shadow-[2px_2px_0px_0px_var(--color-text)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                        >
                          📥 PDF
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center font-mono text-xs uppercase text-text-soft">
                    No se encontraron registros que coincidan.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECCIÓN: MI PERFIL */}
          {seccionActiva === "perfil" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 bg-surface border-2 border-text p-6 shadow-[4px_4px_0px_0px_var(--color-text)] relative">
                <form onSubmit={formik.handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight border-b-2 border-text pb-2 mb-6">
                      Configuración de Perfil
                    </h2>

                    {/* Foto de Perfil / Avatar */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border-2 border-dashed border-text/40 bg-background/50 mb-6 shadow-[2px_2px_0px_0px_var(--color-text)]">
                      <div className="shrink-0">
                        {imagePreview ? (
                          <div className="w-24 h-24 border-4 border-text shadow-[3px_3px_0px_0px_rgba(23,23,23,1)] overflow-hidden bg-surface">
                            <img
                              src={imagePreview}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 border-4 border-text bg-secondary flex items-center justify-center text-center p-1 shadow-[3px_3px_0px_0px_rgba(23,23,23,1)]">
                            <span className="font-mono text-[9px] font-black uppercase text-text/70 tracking-tighter">
                              SIN FOTO
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 text-center sm:text-left w-full">
                        <label className="block text-[10px] font-black uppercase text-text font-mono tracking-wider">
                          Foto de perfil (Avatar)
                        </label>
                        <p className="text-[11px] text-text-soft font-mono uppercase mb-2">
                          JPG, PNG. Máx: 2MB.
                        </p>
                        <label
                          htmlFor="profileImage"
                          className="inline-block px-3 py-1.5 bg-surface-2 border-2 border-text font-mono text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-[2px_2px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
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

                    {/* Inputs de datos del perfil */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black uppercase text-text-soft mb-1 font-mono tracking-wider">
                          Email de usuario (No modificable)
                        </label>
                        <input
                          type="text"
                          disabled
                          value="user.techno@boletoclick.com"
                          className="w-full bg-surface-2 border-2 border-text/40 text-text-soft/70 px-4 py-2.5 text-xs font-mono cursor-not-allowed focus:outline-none uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-text mb-1 font-mono tracking-wider">
                          Nombre completo del titular
                        </label>
                        <input
                          type="text"
                          {...formik.getFieldProps("nombreTitular")}
                          className="w-full bg-background border-2 border-text text-text px-4 py-2.5 text-xs font-black uppercase focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                        {formik.touched.nombreTitular &&
                          formik.errors.nombreTitular && (
                            <span className="text-red-500 font-mono text-[10px] uppercase mt-0.5 block">
                              {formik.errors.nombreTitular}
                            </span>
                          )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-text mb-1 font-mono tracking-wider">
                          DNI
                        </label>
                        <input
                          type="text"
                          maxLength={8}
                          {...formik.getFieldProps("dni")}
                          onChange={(e) =>
                            formik.setFieldValue(
                              "dni",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          className="w-full bg-background border-2 border-text text-text px-4 py-2.5 text-xs font-mono font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                        {formik.touched.dni && formik.errors.dni && (
                          <span className="text-red-500 font-mono text-[10px] uppercase mt-0.5 block">
                            {formik.errors.dni}
                          </span>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black uppercase text-text mb-1 font-mono tracking-wider">
                          Teléfono Móvil
                        </label>
                        <input
                          type="text"
                          {...formik.getFieldProps("telefono")}
                          onChange={(e) =>
                            formik.setFieldValue(
                              "telefono",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          className="w-full bg-background border-2 border-text text-text px-4 py-2.5 text-xs font-mono font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                        {formik.touched.telefono && formik.errors.telefono && (
                          <span className="text-red-500 font-mono text-[10px] uppercase mt-0.5 block">
                            {formik.errors.telefono}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Seguridad de la Cuenta */}
                    <h3 className="text-sm font-black uppercase tracking-tight border-b-2 border-text/40 pb-1 mt-6 mb-4">
                      Seguridad de la Cuenta
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-text mb-1 font-mono tracking-wider">
                          Contraseña Actual
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          {...formik.getFieldProps("passwordActual")}
                          className="w-full bg-background border-2 border-text text-text px-4 py-2.5 text-xs font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-text mb-1 font-mono tracking-wider">
                          Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          placeholder="MÍNIMO 6 CARACTERES"
                          {...formik.getFieldProps("passwordNueva")}
                          className="w-full bg-background border-2 border-text text-text px-4 py-2.5 text-xs font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                        {formik.touched.passwordNueva &&
                          formik.errors.passwordNueva && (
                            <span className="text-red-500 font-mono text-[10px] uppercase mt-0.5 block">
                              {formik.errors.passwordNueva}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Preferencias de Comunicación (Newsletter) */}
                    <h3 className="text-sm font-black uppercase tracking-tight border-b-2 border-text/40 pb-1 mt-6 mb-4">
                      Preferencias de Comunicación
                    </h3>

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
                          className={`w-6 h-6 border-2 border-text flex items-center justify-center transition-all ${
                            formik.values.allowNewsletter
                              ? "bg-primary"
                              : "bg-surface-2"
                          }`}
                        >
                          {formik.values.allowNewsletter && (
                            <span className="text-background font-black text-xs">
                              ✔
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="font-black uppercase text-sm tracking-wide">
                          Suscribirme al boletín de noticias
                        </p>
                        <p className="text-xs font-mono text-text-soft mt-1">
                          Recibí novedades, eventos destacados y promociones
                          exclusivas.
                        </p>
                      </div>
                    </label>

                    {/* Feedback Status */}
                    {submitStatus === "success" && (
                      <div className="mt-4 border-2 border-success bg-success/10 p-4 font-mono text-xs font-bold uppercase text-success">
                        ✅ Perfil actualizado correctamente
                      </div>
                    )}
                    {submitStatus === "error" && (
                      <div className="mt-4 border-2 border-red-500 bg-red-500/10 p-4 font-mono text-xs font-bold uppercase text-red-500">
                        ❌ Hubo un error al guardar. Intentá de nuevo.
                      </div>
                    )}

                    {/* Botón Submit del Form */}
                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={isProfileLoading}
                        className="bg-primary text-background border-2 border-text font-mono font-black px-5 py-2.5 text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer w-full sm:w-auto"
                      >
                        {isProfileLoading
                          ? uploadingImage
                            ? "[ SUBIENDO IMAGEN... ]"
                            : "[ GUARDANDO... ]"
                          : "Guardar Cambios"}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Zona de Peligro */}
                <div className="pt-6 border-t-2 border-dashed border-text/40 mt-6">
                  <p className="font-mono text-[11px] text-text-soft mb-4 leading-relaxed uppercase">
                    Al eliminar tu cuenta vas a perder el acceso inmediato a tus
                    entradas vigentes.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm("¿De verdad querés eliminar tu cuenta?")) {
                        alert("Cuenta eliminada.");
                      }
                    }}
                    className="bg-transparent hover:bg-red-500/10 text-red-500 border-2 border-red-500 font-mono font-black px-4 py-2.5 text-xs uppercase tracking-wider transition-colors cursor-pointer w-full text-center"
                  >
                    Eliminar cuenta de forma permanente
                  </button>
                </div>
              </div>

              {/* Métodos de Pago Lateral */}
              <div className="space-y-6">
                <div className="bg-surface border-2 border-text p-6 shadow-[4px_4px_0px_0px_var(--color-text)]">
                  <h2 className="text-lg font-black uppercase tracking-tight border-b-2 border-text pb-2 mb-4">
                    💳 Métodos de Pago
                  </h2>

                  <div className="space-y-3 mb-6">
                    {tarjetas.length === 0 ? (
                      <p className="font-mono text-[10px] uppercase text-text-soft text-center p-4 border border-dashed border-text/30">
                        No tenés tarjetas vinculadas.
                      </p>
                    ) : (
                      tarjetas.map((card) => (
                        <div
                          key={card.id}
                          className="bg-background border-2 border-text p-3 flex items-center justify-between shadow-[2px_2px_0px_0px_var(--color-text)] font-mono"
                        >
                          <div>
                            <span className="text-[10px] bg-text text-surface px-1.5 py-0.5 font-black uppercase block w-max mb-1">
                              {card.tipo}
                            </span>
                            <p className="text-xs font-black uppercase tracking-tight">
                              {card.marca}
                            </p>
                            <p className="text-[11px] text-text-soft font-bold mt-0.5">
                              •••• •••• •••• {card.ultimosCuatro}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleEliminarTarjeta(card.id)}
                            className="text-xs font-black text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500 px-2 py-1 uppercase tracking-tighter transition-all cursor-pointer"
                          >
                            [ Borrar ]
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <form
                    onSubmit={handleAgregarTarjeta}
                    className="border-t-2 border-dashed border-text/30 pt-4 space-y-3"
                  >
                    <span className="block text-[11px] font-black uppercase text-text font-mono tracking-wider">
                      + Vincular nueva tarjeta
                    </span>

                    <div>
                      <select
                        value={nuevaTarjetaTipo}
                        onChange={(e) =>
                          setNuevaTarjetaTipo(
                            e.target.value as "Crédito" | "Débito",
                          )
                        }
                        className="w-full bg-background border-2 border-text text-text p-2 font-mono text-xs font-bold uppercase focus:outline-none"
                      >
                        <option value="Débito">Tarjeta de Débito</option>
                        <option value="Crédito">Tarjeta de Crédito</option>
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        required
                        maxLength={16}
                        placeholder="NÚMERO DE TARJETA (16 DÍGITOS)"
                        value={nuevaTarjetaNumero}
                        onChange={(e) =>
                          setNuevaTarjetaNumero(
                            e.target.value.replace(/\D/g, ""),
                          )
                        }
                        className="w-full bg-background border-2 border-text text-text p-2 font-mono text-xs font-bold focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={nuevaTarjetaNumero.length < 4}
                      className="w-full bg-secondary text-text border-2 border-text font-mono font-black py-2 text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_var(--color-text)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-40 cursor-pointer"
                    >
                      Asociar Tarjeta
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal / Expansión de Ticket */}
      {ticketExpandido && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setTicketExpandido(null)}
        >
          <div
            className="bg-white text-black border-4 border-black max-w-sm w-full p-6 rounded-none shadow-[8px_8px_0px_0px_#CCFF00] flex flex-col justify-between relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-black/95 rounded-r-full border-r-4 border-y-4 border-black -ml-1"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-black/95 rounded-l-full border-l-4 border-y-4 border-black -mr-1"></div>

            <div className="border-b-4 border-black border-dashed pb-5 text-center">
              <span className="font-mono text-[10px] bg-black text-white px-2 py-0.5 uppercase font-black tracking-widest">
                PASES DIGITALES BOLETOCLICK
              </span>
              <h2 className="text-black font-black text-2xl uppercase tracking-tighter mt-4 leading-tight">
                {ticketExpandido.evento}
              </h2>
              <p className="text-black font-mono font-black text-sm mt-1">
                {ticketExpandido.fecha}
              </p>
              <div className="mt-3">
                <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block mb-1">
                  SECTOR ASIGNADO
                </span>
                <span className="bg-black text-white px-3 py-1 text-xs font-mono font-black uppercase tracking-wider">
                  {ticketExpandido.zona}
                </span>
              </div>
            </div>

            <div className="my-6 bg-white p-4 border-4 border-black flex flex-col items-center justify-center aspect-square w-full max-w-60 mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-full h-full bg-black text-white flex flex-col items-center justify-center p-4 text-center font-mono text-xs uppercase font-black tracking-widest select-none">
                <span className="text-4xl mb-3">🏁</span>
                <span className="bg-white text-black px-2 py-0.5 font-mono text-[11px] font-black tracking-normal mb-1">
                  [{ticketExpandido.qr}]
                </span>
                <span className="text-[9px] text-neutral-400 mt-2 tracking-tighter">
                  DIGITAL TICKET ID
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-center text-[10px] font-mono font-black text-neutral-600 uppercase tracking-tight">
                📱 Presentá esta pantalla directamente en los lectores de puerta
              </p>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() =>
                    alert("Simulación: Agregando pase a Wallet...")
                  }
                  className="w-full bg-neutral-100 hover:bg-neutral-200 text-black font-mono font-black py-2.5 text-[11px] uppercase tracking-wider border-2 border-black transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  💼 AGREGAR A WALLET
                </button>
                <button
                  onClick={() => setTicketExpandido(null)}
                  className="w-full bg-black hover:bg-neutral-900 text-white font-mono font-black py-2.5 text-[11px] uppercase tracking-wider border-2 border-black transition-colors cursor-pointer"
                >
                  [ VOLVER A MIS ENTRADAS ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
