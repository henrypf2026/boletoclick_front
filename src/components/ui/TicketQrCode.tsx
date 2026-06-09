'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { toScannableQrValue } from '@/lib/ticketQr';

interface TicketQrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export default function TicketQrCode({
  value,
  size = 112,
  className = '',
}: TicketQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const qrValue = toScannableQrValue(value);

    QRCode.toDataURL(qrValue, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#171717', light: '#ffffff' },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl(null);
      });

    return () => {
      active = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        className={`animate-pulse bg-surface-2 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="Código QR de la entrada"
      width={size}
      height={size}
      className={className}
    />
  );
}
