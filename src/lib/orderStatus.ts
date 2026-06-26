export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

interface TicketStatusInput {
  allowEntrance: boolean;
  usedAt?: string | null;
}

interface OrderStatusInput {
  status: OrderStatus;
  tickets?: TicketStatusInput[];
}

interface TicketCardInput extends TicketStatusInput {
  order: { status: OrderStatus };
}

function ticketsLookCancelled(tickets: TicketStatusInput[]): boolean {
  return (
    tickets.length > 0 &&
    tickets.every((ticket) => !ticket.allowEntrance && !ticket.usedAt)
  );
}

export function isTicketCancelled(ticket: TicketCardInput): boolean {
  if (ticket.order.status === 'CANCELLED') return true;
  if (ticket.usedAt) return false;
  if (!ticket.allowEntrance) return true;
  return false;
}

export function getEffectiveOrderStatus(order: OrderStatusInput): OrderStatus {
  if (order.status === 'CANCELLED') return 'CANCELLED';

  if (order.tickets && ticketsLookCancelled(order.tickets)) {
    return 'CANCELLED';
  }

  return order.status;
}

export function orderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'PAID':
      return 'PAGADO';
    case 'PENDING':
      return 'PENDIENTE';
    case 'FAILED':
      return 'FALLIDO';
    case 'REFUNDED':
      return 'REEMBOLSADO';
    case 'CANCELLED':
      return 'CANCELADO';
  }
}

export function orderStatusColor(status: OrderStatus): string {
  switch (status) {
    case 'PAID':
      return 'text-success bg-success/10 border-success';
    case 'PENDING':
      return 'text-yellow-600 bg-yellow-400/10 border-yellow-500';
    case 'FAILED':
      return 'text-red-500 bg-red-500/10 border-red-500';
    case 'REFUNDED':
      return 'text-text-soft bg-surface-2 border-text/30';
    case 'CANCELLED':
      return 'text-text-soft bg-surface-2 border-text/30';
  }
}

export function orderStatusBadgeColor(status: OrderStatus): string {
  switch (status) {
    case 'PAID':
      return '#6750e0';
    case 'REFUNDED':
      return '#555555';
    case 'CANCELLED':
      return '#555555';
    case 'PENDING':
      return '#b45309';
    case 'FAILED':
      return '#cc3333';
  }
}
