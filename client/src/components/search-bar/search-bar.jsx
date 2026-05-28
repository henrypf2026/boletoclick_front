import { TextInput } from 'flowbite-react';

function SearchBar({ value, onChange, placeholder = 'Buscar eventos, equipos o venues...' }) {
  return (
    <TextInput
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      sizing="md"
      className="w-full"
    />
  );
}

export default SearchBar;
