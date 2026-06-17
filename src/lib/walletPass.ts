import QRCode from 'qrcode';
import { toScannableQrValue } from '@/lib/ticketQr';

interface WalletTicketInfo {
  id: string;
  eventTitle: string;
  zone?: string | null;
  ticketTypeName?: string;
  qrCode: string;
}

export async function addTicketToWallet(ticket: WalletTicketInfo): Promise<void> {
  const scanUrl = toScannableQrValue(ticket.qrCode);
  const title = ticket.eventTitle || ticket.ticketTypeName || 'Entrada BoletoClick';
  const subtitle = [ticket.zone, ticket.ticketTypeName].filter(Boolean).join(' · ');

  const qrDataUrl = await QRCode.toDataURL(scanUrl, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#171717', light: '#ffffff' },
  });

  const blob = await (await fetch(qrDataUrl)).blob();
  const file = new File([blob], `boleto-${ticket.id.slice(0, 8)}.png`, {
    type: 'image/png',
  });

  if (typeof navigator !== 'undefined' && navigator.share) {
    const shareData: ShareData = {
      title: `BoletoClick — ${title}`,
      text: `${title}${subtitle ? `\n${subtitle}` : ''}\n${scanUrl}`,
      url: scanUrl,
    };

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ ...shareData, files: [file] });
      return;
    }

    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
    }
  }

  const link = document.createElement('a');
  link.href = qrDataUrl;
  link.download = `boleto-${ticket.id.slice(0, 8)}.png`;
  link.click();
}
