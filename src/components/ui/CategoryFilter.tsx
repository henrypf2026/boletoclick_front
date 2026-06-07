'use client';

interface Category {
  id: string;
  label: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onChange: (id: string) => void;
}

export default function CategoryFilter({ categories, activeCategory, onChange }: CategoryFilterProps) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={`min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeCategory === category.id
              ? 'bg-primary text-background'
              : 'bg-surface-2 text-text hover:bg-surface'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
