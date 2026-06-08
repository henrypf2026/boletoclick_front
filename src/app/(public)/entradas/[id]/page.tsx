import { Suspense } from 'react';
import EntradaContent from './EntradaContent';

export default function EntradaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh -mx-4 -my-8 flex items-center justify-center px-4">
          <p className="text-sm font-bold text-text-soft">Cargando entrada…</p>
        </div>
      }
    >
      <EntradaContent />
    </Suspense>
  );
}
