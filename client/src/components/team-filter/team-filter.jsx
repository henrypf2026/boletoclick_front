import { Button } from 'flowbite-react';

function TeamFilter({ teams, activeTeam, onChange }) {
  return (
    <div>
      <p className="mb-3 text-sm text-gray-400">Filtrar por equipo</p>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {teams.map((team) => (
          <Button
            key={team.id}
            color={activeTeam === team.id ? 'success' : 'gray'}
            onClick={() => onChange(team.id)}
            className="flex min-w-[88px] shrink-0 flex-col items-center gap-1 py-3"
          >
            <span className="text-xl">{team.emoji}</span>
            <span className="text-xs">{team.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

export default TeamFilter;
