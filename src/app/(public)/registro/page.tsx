import { Card } from 'flowbite-react';
import Link from 'next/link';
import { RegisterForm } from './RegisterForm';

export default function RegistroPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8 -mx-4 -my-8">
      <Card className="w-full max-w-md border-border bg-surface">
        <Link href="/" className="text-sm text-text-soft hover:text-text">
          ← Volver al inicio
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-text">Registrarme</h1>
        <RegisterForm />
      </Card>
    </div>
  );
}
