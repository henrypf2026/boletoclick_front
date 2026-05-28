import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from 'flowbite-react';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../search-bar/search-bar';

function Header({ search, onSearchChange }) {
  const { authenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar fluid rounded className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 px-4 backdrop-blur">
      <NavbarBrand as={Link} to="/" className="gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-cyan-400 text-sm font-extrabold text-gray-950">
          BC
        </span>
        <span className="self-center whitespace-nowrap text-lg font-bold text-white">
          BoletoClick
        </span>
      </NavbarBrand>

      <div className="order-2 hidden w-full max-w-md flex-1 px-0 md:order-1 md:flex md:px-4">
        <SearchBar value={search} onChange={onSearchChange} />
      </div>

      <div className="order-1 flex items-center gap-2 md:order-2">
        {authenticated ? (
          <>
            <span className="hidden text-sm text-gray-400 lg:inline">
              Hola, {user.name.split(' ')[0]}
            </span>
            <Button as={Link} to="/mis-entradas" color="gray" size="sm" className="hidden sm:inline-flex">
              Mis entradas
            </Button>
            <Button color="gray" size="sm" outline onClick={handleLogout} className="hidden sm:inline-flex">
              Salir
            </Button>
          </>
        ) : (
          <>
            <Button as={Link} to="/login" color="gray" size="sm" outline className="hidden sm:inline-flex">
              Iniciar sesión
            </Button>
            <Button as={Link} to="/registro" size="sm" className="hidden bg-brand text-gray-950 hover:bg-brand-dark sm:inline-flex">
              Registrarme
            </Button>
          </>
        )}
        <NavbarToggle />
      </div>

      <NavbarCollapse className="order-3 w-full md:hidden">
        <div className="mb-3 w-full">
          <SearchBar value={search} onChange={onSearchChange} />
        </div>
        {authenticated ? (
          <>
            <NavbarLink as={Link} to="/mis-entradas" active>
              Mis entradas
            </NavbarLink>
            <NavbarLink onClick={handleLogout}>Salir</NavbarLink>
          </>
        ) : (
          <>
            <NavbarLink as={Link} to="/login">Iniciar sesión</NavbarLink>
            <NavbarLink as={Link} to="/registro">Registrarme</NavbarLink>
          </>
        )}
      </NavbarCollapse>
    </Navbar>
  );
}

export default Header;
