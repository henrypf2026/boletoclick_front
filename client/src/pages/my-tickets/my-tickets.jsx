import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from 'flowbite-react';
import Header from '../../components/header/header';
import Footer from '../../components/footer/footer';
import { useAuth } from '../../context/AuthContext';
import { formatEventDate, formatPrice } from '../../data/events';
import { getTicketsByUser } from '../../utils/helpers/auth';

function MyTickets() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const tickets = useMemo(
    () => getTicketsByUser(user.id).slice().reverse(),
    [user.id],
  );

  return (
    <div className="min-h-dvh bg-gray-950">
      <Header search={search} onSearchChange={setSearch} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Mis entradas</h1>
            <p className="text-gray-400">
              Tus boletos con código QR listos para el acceso al evento.
            </p>
          </div>
          <Button
            as={Link}
            to="/"
            className="w-full bg-brand text-gray-950 hover:bg-brand-dark md:w-auto"
          >
            Buscar más eventos
          </Button>
        </div>

        {!tickets.length ? (
          <Card className="border-gray-800 bg-gray-900 text-center">
            <p className="text-gray-400">Aún no tienes entradas compradas.</p>
            <Link to="/" className="mt-3 inline-block text-brand hover:underline">
              Explorar eventos disponibles
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => {
              const date = formatEventDate(ticket.date, ticket.time);

              return (
                <Card
                  key={ticket.id}
                  className="border-gray-800 bg-gray-900"
                >
                  <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
                    <div className="text-center md:text-left">
                      <h2 className="text-lg font-bold text-white">{ticket.eventTitle}</h2>
                      <p className="text-sm text-gray-400">{ticket.venue}</p>
                      <p className="text-sm text-gray-400">
                        {date.full} · {date.time} hs
                      </p>
                      <p className="text-sm text-gray-400">
                        {ticket.zone} · {ticket.quantity} boleto(s)
                      </p>
                      <strong className="mt-2 inline-block text-brand">
                        {formatPrice(ticket.total)}
                      </strong>
                    </div>
                    <div className="text-center">
                      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-xl border-2 border-dashed border-brand p-2 text-xs font-bold text-brand">
                        {ticket.qrCode}
                      </div>
                      <span className="mt-2 block max-w-[140px] text-xs text-gray-400">
                        Presenta este QR en el acceso
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default MyTickets;
