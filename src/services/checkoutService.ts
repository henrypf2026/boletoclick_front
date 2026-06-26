import { authenticatedFetch } from '@/lib/authenticatedFetch';
export const checkoutService = {
  async validateCoupon(code: string) {
    const res = await authenticatedFetch(`/api/backend/coupons/validate/${code}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error("Cupón inválido");
    return res.json();
  },
};