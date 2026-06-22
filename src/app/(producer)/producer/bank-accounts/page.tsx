import { cookies } from "next/headers";
import BankForm from "./BankForm";
import { mapApiToForm, type ApiBankAccount } from "./bankAccountMapper";

export const dynamic = "force-dynamic";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function getBankData() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) return null;

    const res = await fetch(`${BACKEND_URL}/bank-accounts/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const account = (await res.json()) as ApiBankAccount;
    return mapApiToForm(account);
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
