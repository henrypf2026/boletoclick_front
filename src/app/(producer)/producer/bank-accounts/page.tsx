"use client";

import Link from "next/link";
import BankForm from "./BankForm";

export default function BankAccountsPage() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <Link
          href="/producer/dashboard"
          className="inline-block font-mono text-xs font-black uppercase tracking-wider text-text-soft hover:text-text"
        >
          ← Volver al Dashboard
        </Link>
        <h1 className="text-3xl font-black uppercase tracking-tight text-text">
          Datos de Cobro
        </h1>
        <p className="text-text-soft font-medium">
          Configurá la cuenta bancaria donde vas a recibir los fondos de tus
          ventas.
        </p>
      </div>

      <BankForm />
    </div>
  );
}
