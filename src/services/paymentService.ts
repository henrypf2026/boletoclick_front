export interface PurchaseData {
  id: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  venue: string;
  date: string;
  time: string;
  quantity: number;
  total: number;
  qrCode: string;
  purchasedAt: string;
}

export const paymentService = {

  async createCheckoutSession(data: PurchaseData) {

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payments/create-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      throw new Error('Error creando sesión de pago');
    }

    return response.json();

  }

};