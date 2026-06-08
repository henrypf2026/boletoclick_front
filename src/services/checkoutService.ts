import { getToken } from "@/lib/auth";

export const checkoutService = {
  async validateCoupon(code: string) {
    const token = getToken();
    const res = await fetch(`/api/backend/coupons/validate/${code}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Cupón inválido");
    return res.json();
  },
};