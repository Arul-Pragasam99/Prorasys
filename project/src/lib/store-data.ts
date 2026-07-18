export type StoreProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  badge: string;
  color: string;
};

export const featuredProducts: StoreProduct[] = [
  {
    id: 'p-100',
    name: 'Aurora Headphones',
    description: 'Immersive sound with noise canceling for work and travel.',
    price: 189,
    category: 'Electronics',
    rating: 4.8,
    badge: 'Best seller',
    color: 'from-sky-500 to-cyan-400',
  },
  {
    id: 'p-101',
    name: 'Lumen Smart Lamp',
    description: 'Adaptive lighting with voice control and warm ambience.',
    price: 89,
    category: 'Home',
    rating: 4.6,
    badge: 'New arrival',
    color: 'from-fuchsia-500 to-rose-400',
  },
  {
    id: 'p-102',
    name: 'Northside Backpack',
    description: 'A durable, weatherproof bag built for daily commutes.',
    price: 74,
    category: 'Fashion',
    rating: 4.7,
    badge: 'Trending',
    color: 'from-emerald-500 to-lime-400',
  },
];

export const categories = [
  { title: 'Electronics', description: 'Phones, audio, and smart devices' },
  { title: 'Fashion', description: 'Everyday essentials and accessories' },
  { title: 'Home', description: 'Comfort upgrades for modern spaces' },
];
