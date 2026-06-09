'use client';

import { useState } from 'react';
import { addTicketToWallet } from '@/lib/walletPass';

interface AddToWalletButtonProps {
  ticket: {
    id: string;
    qrCode: string;
    eventTitle?: string;
    ticketTypeName?: string;
    zone?: string | null;
  };
  className?: string;
  variant?: 'light' | 'dark';
}

export default function AddToWalletButton({
  ticket,
  className = '',
  variant = 'light',
}: AddToWalletButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    setMessage('');

    try {
      await addTicketToWallet({
        id: ticket.id,
        qrCode: ticket.qrCode,
        eventTitle: ticket.eventTitle ?? ticket.ticketTypeName ?? 'Entrada',
        ticketTypeName: ticket.ticketTypeName,
        zone: ticket.zone,
      });
      setMessage('Listo');
    } catch {
      setMessage('No se pudo compartir. Descargá el QR e intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const baseStyles =
    variant === 'dark'
      ? 'bg-black hover:bg-neutral-900 text-white border-black'
      : 'bg-neutral-100 hover:bg-neutral-200 text-black border-black';

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`w-full font-mono font-black py-2.5 text-[11px] uppercase tracking-wider border-2 transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 ${baseStyles} ${className}`}
      >
        {loading ? 'Preparando…' : '💼 Agregar a Wallet'}
      </button>
      {message && (
        <p className="mt-2 text-center text-[10px] font-mono text-neutral-500">{message}</p>
      )}
    </div>
  );
}
