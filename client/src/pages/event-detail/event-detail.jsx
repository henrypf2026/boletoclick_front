import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Label, Select, TextInput } from 'flowbite-react';
import Header from '../../components/header/header';
import Footer from '../../components/footer/footer';
import { useAuth } from '../../context/AuthContext';
import { formatEventDate, formatPrice, getEventById } from '../../data/events';
import { saveTicket } from '../../utils/helpers/auth';

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authenticated, user } = useAuth();
  const event = getEventById(id);
  const [search, setSearch] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [zoneId, setZoneId] = useState(event?.zones[0]?.id || '');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [message, setMessage] = useState('');

  const selectedZone = event?.zones.find((zone) => zone.id === zoneId);
  const date = event ? formatEventDate(event.date, event.time) : null;

  const total = useMemo(() => {
    if (!selectedZone) return 0;
    const subtotal = selectedZone.price * quantity;
    return promoApplied ? Math.round(subtotal * 0.9) : subtotal;
  }, [selectedZone, quantity, promoApplied]);

  if (!event) {
    return <Navigate to="/" replace />;
  }

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'BOLETO10') {
      setPromoApplied(true);
      setMessage('Código aplicado: 10% de descuento.');
      return;
    }

    setPromoApplied(false);
    setMessage('Código no válido. Prueba BOLETO10.');
  };

  const handlePurchase = () => {
    if (!authenticated) {
      navigate('/login', { state: { from: `/evento/${event.id}` } });
      return;
    }

    if (!selectedZone || quantity > selectedZone.available) {
      setMessage('Cantidad no disponible en esa zona.');
      return;
    }

    saveTicket({
      id: crypto.randomUUID(),
      userId: user.id,
      eventId: event.id,
      eventTitle: event.title,
      venue: event.venue,
      date: event.date,
      time: event.time,
      zone: selectedZone.name,
      quantity,
      total,
      qrCode: `BC-${Date.now()}`,
      purchasedAt: new Date().toISOString(),
    });

    navigate('/mis-entradas');
  };

  return (
    <div className="min-h-dvh bg-gray-950">
      <Header search={search} onSearchChange={setSearch} />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Link to="/" className="text-sm text-gray-400 hover:text-white">
          ← Volver a eventos
        </Link>

        <div
          className="mt-4 flex flex-col justify-between gap-4 rounded-2xl p-6 md:flex-row md:items-end"
          style={{ background: event.imageGradient }}
        >
          <div>
            <Badge color="dark" className="mb-2 uppercase">
              {event.category}
            </Badge>
            <h1 className="text-2xl font-bold text-white md:text-4xl">{event.title}</h1>
            <p className="mt-2 text-white/90">{event.subtitle}</p>
          </div>
          <div className="rounded-xl bg-black/45 px-4 py-3 text-center">
            <strong className="block text-lg text-white">
              {date.day} {date.month}
            </strong>
            <span className="text-sm text-white/90">{date.time} hs</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Card className="border-gray-800 bg-gray-900 lg:col-span-3">
            <h2 className="mb-4 text-lg font-bold text-white">Información del evento</h2>
            <ul className="grid list-disc gap-2 pl-5 text-gray-400">
              <li><strong className="text-white">Venue:</strong> {event.venue}</li>
              <li><strong className="text-white">Ciudad:</strong> {event.city}</li>
              <li><strong className="text-white">Fecha:</strong> {date.full}</li>
              <li><strong className="text-white">Acceso:</strong> QR digital en Mis entradas</li>
            </ul>
          </Card>

          <Card className="border-gray-800 bg-gray-900 lg:col-span-2">
            <h2 className="mb-4 text-lg font-bold text-white">Comprar entradas</h2>

            <div className="mb-4">
              <Label htmlFor="quantity" className="mb-2 block">Cantidad</Label>
              <Select
                id="quantity"
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </Select>
            </div>

            <div className="mb-4">
              <Label htmlFor="zone" className="mb-2 block">Zona / tribuna</Label>
              <Select
                id="zone"
                value={zoneId}
                onChange={(event) => setZoneId(event.target.value)}
              >
                {event.zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} · {formatPrice(zone.price)} ({zone.available} disp.)
                  </option>
                ))}
              </Select>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
              <TextInput
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value)}
                placeholder="Código de promoción"
              />
              <Button color="gray" onClick={handleApplyPromo}>
                Aplicar
              </Button>
            </div>

            <div className="mb-4 flex items-center justify-between border-t border-gray-800 pt-4">
              <span className="text-gray-400">Total</span>
              <strong className="text-xl text-brand">{formatPrice(total)}</strong>
            </div>

            {message && <Alert color="info" className="mb-4">{message}</Alert>}

            <Button
              onClick={handlePurchase}
              className="w-full bg-brand text-gray-950 hover:bg-brand-dark"
            >
              {authenticated ? 'Confirmar compra' : 'Inicia sesión para comprar'}
            </Button>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default EventDetail;
