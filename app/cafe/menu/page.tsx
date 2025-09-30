import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Leaf, Milk, Wheat, Wallet } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Menu',
  description: 'Explore our full menu of artisan coffee, fresh pastries, and light meals. Order in our app from your seat.',
};

interface MenuItem {
  name: string;
  description: string;
  price: string;
  dietaryTags?: string[];
  featured?: boolean;
}

const menuData = {
  coffee: [
    {
      name: 'House Blend',
      description: 'Our signature medium roast with chocolate and caramel notes',
      price: '$3.50',
    },
    {
      name: 'Single-Origin Pour Over',
      description: 'Rotating selection of premium beans, ask your barista',
      price: '$4.50',
      featured: true,
    },
    {
      name: 'Espresso',
      description: 'Rich, full-bodied shot perfect on its own or in drinks',
      price: '$2.75',
    },
    {
      name: 'Cappuccino',
      description: 'Equal parts espresso, steamed milk, and foam',
      price: '$4.25',
    },
    {
      name: 'Flat White',
      description: 'Double shot with microfoam for smooth texture',
      price: '$4.50',
    },
    {
      name: 'Cold Brew',
      description: '24-hour cold extraction for smooth, low-acid flavor',
      price: '$3.75',
    },
  ] as MenuItem[],
  tea: [
    {
      name: 'Earl Grey',
      description: 'Classic black tea with bergamot oil',
      price: '$3.25',
    },
    {
      name: 'Green Tea',
      description: 'Organic sencha with grassy, fresh notes',
      price: '$3.25',
    },
    {
      name: 'Chai Latte',
      description: 'Spiced tea blend with steamed milk',
      price: '$4.00',
    },
    {
      name: 'Herbal Tea',
      description: 'Selection of caffeine-free blends',
      price: '$3.25',
    },
  ] as MenuItem[],
  pastries: [
    {
      name: 'Almond Croissant',
      description: 'Buttery pastry with almond cream from Arsicault Bakery',
      price: '$3.75',
      featured: true,
    },
    {
      name: 'Chocolate Croissant',
      description: 'Classic pain au chocolat with Belgian dark chocolate',
      price: '$3.50',
    },
    {
      name: 'Blueberry Muffin',
      description: 'Made with local berries and lemon zest',
      price: '$3.25',
      dietaryTags: ['vegetarian'],
    },
    {
      name: 'Sourdough Toast',
      description: 'Thick-cut with house-made jam or avocado',
      price: '$4.50',
      dietaryTags: ['vegan option'],
    },
  ] as MenuItem[],
  meals: [
    {
      name: 'Avocado Toast',
      description: 'Sourdough with smashed avocado, radish, everything seasoning',
      price: '$12.00',
      dietaryTags: ['vegetarian', 'vegan option'],
      featured: true,
    },
    {
      name: 'Breakfast Bowl',
      description: 'Quinoa, roasted vegetables, poached egg, tahini dressing',
      price: '$14.00',
      dietaryTags: ['vegetarian', 'gluten-free'],
    },
    {
      name: 'Grilled Cheese & Soup',
      description: 'Artisan cheese on sourdough with daily soup',
      price: '$11.50',
      dietaryTags: ['vegetarian'],
    },
    {
      name: 'Grain Bowl',
      description: 'Farro, seasonal vegetables, protein, house vinaigrette',
      price: '$13.50',
      dietaryTags: ['vegetarian', 'vegan option'],
    },
  ] as MenuItem[],
};

const getDietaryIcon = (tag: string) => {
  switch (tag) {
    case 'vegetarian':
      return <Leaf className="h-3 w-3" />;
    case 'vegan':
    case 'vegan option':
      return <Leaf className="h-3 w-3" />;
    case 'gluten-free':
      return <Wheat className="h-3 w-3" />;
    case 'dairy-free':
      return <Milk className="h-3 w-3" />;
    default:
      return null;
  }
};

function MenuSection({ items }: { items: MenuItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item, index) => (
        <Card key={index} className={item.featured ? 'border-cs-blue shadow-md' : ''}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  {item.name}
                  {item.featured && (
                    <Badge variant="secondary" className="text-xs">Featured</Badge>
                  )}
                </CardTitle>
                {item.dietaryTags && (
                  <div className="flex gap-1 mt-2">
                    {item.dietaryTags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs flex items-center gap-1">
                        {getDietaryIcon(tag)}
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-lg font-bold text-cs-blue ml-4">{item.price}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function MenuPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-12">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Full Menu
            </Badge>
            <h1 className="font-display text-4xl lg:text-6xl font-bold mb-6">
              Fresh. Local. <span className="gradient-text">Delicious.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Every item is carefully sourced from local partners and crafted fresh daily. 
              Order from your seat with our mobile app.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/app">Order in App</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#" target="_blank" rel="noopener noreferrer">
                  <Wallet className="mr-2 h-5 w-5" />
                  Get 10% Off with NFT
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Tabs */}
      <section className="py-12">
        <div className="container max-w-6xl">
          {/* NFT Benefits Notice */}
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="bg-gradient-to-r from-cs-sun/10 to-cs-apricot/10 border-cs-sun/20">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4 inline mr-1" />
                  <strong>NFT Holders:</strong> Get 10% off all cafe items when you connect your wallet
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="coffee" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-12">
              <TabsTrigger value="coffee">Coffee</TabsTrigger>
              <TabsTrigger value="tea">Tea</TabsTrigger>
              <TabsTrigger value="pastries">Pastries</TabsTrigger>
              <TabsTrigger value="meals">Light Meals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="coffee" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold mb-2">Coffee</h2>
                <p className="text-muted-foreground">
                  Expertly crafted using beans from local Santa Cruz roasters
                </p>
              </div>
              <MenuSection items={menuData.coffee} />
            </TabsContent>
            
            <TabsContent value="tea" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold mb-2">Tea & Other Beverages</h2>
                <p className="text-muted-foreground">
                  Premium loose-leaf teas and specialty beverages
                </p>
              </div>
              <MenuSection items={menuData.tea} />
            </TabsContent>
            
            <TabsContent value="pastries" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold mb-2">Pastries & Baked Goods</h2>
                <p className="text-muted-foreground">
                  Fresh daily from our local bakery partners
                </p>
              </div>
              <MenuSection items={menuData.pastries} />
            </TabsContent>
            
            <TabsContent value="meals" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold mb-2">Light Meals</h2>
                <p className="text-muted-foreground">
                  Healthy, satisfying options perfect for working
                </p>
              </div>
              <MenuSection items={menuData.meals} />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Dietary Information */}
      <section className="py-12 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold mb-4">Dietary Options</h2>
            <p className="text-muted-foreground mb-8">
              We cater to various dietary needs and preferences. Let us know about any allergies or special requirements.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="text-sm px-4 py-2">
                <Leaf className="h-4 w-4 mr-2" />
                Vegetarian Options
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2">
                <Leaf className="h-4 w-4 mr-2" />
                Vegan Options
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2">
                <Wheat className="h-4 w-4 mr-2" />
                Gluten-Free Options
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2">
                <Milk className="h-4 w-4 mr-2" />
                Dairy-Free Options
              </Badge>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}