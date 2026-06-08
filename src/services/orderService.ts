import { getToken } from "@/lib/auth";

export const orderService = {
  async getMyOrders() {
    const token = getToken();
    const res = await fetch("/api/backend/orders/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al traer órdenes");
    return res.json();
  },

  async createOrder(data: { ticketTypeId: string; quantity: number; couponId?: string }) {
    const token = getToken();
    const res = await fetch("/api/backend/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear orden");
    return res.json();
  },
};