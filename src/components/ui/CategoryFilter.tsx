'use client';

import { Button } from 'flowbite-react';

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
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((category) => (
        <Button
          key={category.id}
          size="sm"
          color={activeCategory === category.id ? 'success' : 'gray'}
          onClick={() => onChange(category.id)}
          className="shrink-0"
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}
