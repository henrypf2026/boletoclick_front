import { authenticatedFetch } from '@/lib/authenticatedFetch';
export const orderService = {
  async getMyOrders() {
    const res = await authenticatedFetch("/api/backend/orders/me", {
      credentials: 'include',
    });
    if (!res.ok) throw new Error("Error al traer órdenes");
    return res.json();
  },

  async createOrder(data: { ticketTypeId: string; quantity: number; couponId?: string }) {
    const res = await authenticatedFetch("/api/backend/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear orden");
    return res.json();
  },
};