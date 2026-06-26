"use client";

import { useRouter } from "next/navigation";
import ProducerEventScanner from "@/components/dashboard/ProducerEventScanner";

export default function ScannerPage() {
  const router = useRouter();

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen bg-background text-text font-sans">
      <div className="mb-6 flex justify-between items-center border-b-4 border-text pb-4 gap-4">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-text-soft block mb-1">
            BoletoClick / Control de Accesos
          </span>
          <h1 className="uppercase tracking-tighter text-2xl md:text-3xl font-black">
            Scanner de Entradas
          </h1>
        </div>
        <button
          onClick={() => router.push("/producer/dashboard")}
          className="shrink-0 px-3 py-1.5 bg-surface text-text border-2 border-text font-mono text-xs font-black uppercase tracking-wider hover:translate-x-0.5 hover:translate-y-0.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
        >
          ⬅️ Volver al Panel
        </button>
      </div>

      <ProducerEventScanner />
    </div>
  );
}
