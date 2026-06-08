import { cookies } from "next/headers";
import BankForm from "./BankForm";

export const dynamic = 'force-dynamic';

async function getBankData() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/bank-accounts/me`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        cache: "no-store",
      },
    );

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error cargando datos bancarios:", error);
    return null;
  }
}

export default async function BankAccountsPage() {
  const initialData = await getBankData();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-tight text-text">
          Datos de Cobro
        </h1>
        <p className="text-text-soft font-medium">
          Configurá la cuenta bancaria donde vas a recibir los fondos de tus
          ventas.
        </p>
      </div>

      <BankForm initialData={initialData} />
    </div>
  );
}
