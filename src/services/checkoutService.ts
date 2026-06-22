export const checkoutService = {
  async validateCoupon(code: string) {
    const res = await fetch(`/api/backend/coupons/validate/${code}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error("Cupón inválido");
    return res.json();
  },
};