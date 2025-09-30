'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CategoryFilterProps {
  categories: string[]
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <Tabs value={activeCategory} onValueChange={onCategoryChange}>
      <TabsList className="w-full justify-start overflow-x-auto">
        {categories.map((category) => (
          <TabsTrigger key={category} value={category} className="capitalize">
            {category === 'all' ? 'All Items' : category}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}