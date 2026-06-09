import { getToken } from "@/lib/auth";

export const ticketService = {
  async getMyTickets() {
    const token = getToken();
    const res = await fetch("/api/backend/tickets/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al traer tickets");
    return res.json();
  },
};

