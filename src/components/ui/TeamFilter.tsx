'use client';

interface Team {
  id: string;
  name: string;
  emoji: string;
}

interface TeamFilterProps {
  teams: Team[];
  activeTeam: string;
  onChange: (id: string) => void;
}

export default function TeamFilter({ teams, activeTeam, onChange }: TeamFilterProps) {
  return (
    <div>
      <p className="mb-3 text-sm text-text-soft">Filtrar por equipo</p>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => onChange(team.id)}
            className={`flex min-w-[88px] shrink-0 flex-col items-center gap-1 rounded-lg px-2 py-3 text-center transition-colors ${
              activeTeam === team.id
                ? 'bg-primary text-background'
                : 'bg-surface-2 text-text hover:bg-surface'
            }`}
          >
            <span className="text-xl">{team.emoji}</span>
            <span className="text-xs font-medium">{team.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
