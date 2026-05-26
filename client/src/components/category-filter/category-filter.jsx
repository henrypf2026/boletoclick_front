import { Button } from 'flowbite-react';

function CategoryFilter({ categories, activeCategory, onChange }) {
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

export default CategoryFilter;
