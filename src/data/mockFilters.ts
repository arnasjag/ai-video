import type { FilterConfig, FilterSection } from '../app/types';

// Random AI-style images from picsum
const getImage = (id: number) => `https://picsum.photos/seed/ai${id}/400/500`;

export const allFilters: FilterConfig[] = [
  // Trending - First 3 have AI enabled
  { id: 'glam-ai-1', name: 'Glam AI', icon: '✨', category: 'trending', previewImage: getImage(1), creatorName: 'Glam AI', likes: 3200, isPremium: true, aiEnabled: true, price: 9.99, introTitle: 'Glam AI', introSubtitle: 'Transform into your most glamorous self' },
  { id: 'glam-ai-2', name: 'Glam AI', icon: '✨', category: 'trending', previewImage: getImage(2), creatorName: 'Glam AI', likes: 3100, isPremium: true, aiEnabled: true, price: 9.99, introTitle: 'Glam AI', introSubtitle: 'Transform into your most glamorous self' },
  { id: 'jovany-1', name: 'Portrait Pro', icon: '📸', category: 'trending', previewImage: getImage(3), creatorName: 'JovanyPauc', likes: 2800, isNew: true, aiEnabled: true, price: 9.99, introTitle: 'Portrait Pro', introSubtitle: 'Professional portrait enhancement' },

  // Pandora
  { id: 'pandora-1', name: 'Mystic Glow', icon: '🔮', category: 'pandora', previewImage: getImage(4), creatorName: 'Glam AI', likes: 3000, isPremium: true, price: 9.99, introTitle: 'Mystic Glow', introSubtitle: 'Add ethereal lighting effects' },
  { id: 'pandora-2', name: 'Fire Effect', icon: '🔥', category: 'pandora', previewImage: getImage(5), creatorName: 'EmeliaBeer', likes: 97000, price: 9.99, introTitle: 'Fire Effect', introSubtitle: 'Dramatic fire and flame effects' },
  { id: 'pandora-3', name: 'Dark Fantasy', icon: '⚔️', category: 'pandora', previewImage: getImage(6), creatorName: 'CecilShana', likes: 45000, price: 9.99, introTitle: 'Dark Fantasy', introSubtitle: 'Epic fantasy transformations' },

  // Viral
  { id: 'viral-1', name: 'Dance Sync', icon: '💃', category: 'viral', previewImage: getImage(7), creatorName: 'DanceBot', likes: 120000, price: 9.99, introTitle: 'Dance Sync', introSubtitle: 'Sync your moves to trending dances' },
  { id: 'viral-2', name: 'Meme Face', icon: '😂', category: 'viral', previewImage: getImage(8), creatorName: 'MemeKing', likes: 89000, price: 9.99, introTitle: 'Meme Face', introSubtitle: 'Turn yourself into viral memes' },
  { id: 'viral-3', name: 'Cartoon Me', icon: '🎨', category: 'viral', previewImage: getImage(9), creatorName: 'ToonMaster', likes: 156000, price: 9.99, introTitle: 'Cartoon Me', introSubtitle: 'Transform into cartoon style' },

  // New
  { id: 'new-1', name: 'Neon Dreams', icon: '🌈', category: 'new', previewImage: getImage(10), creatorName: 'NeonLab', likes: 1200, isNew: true, price: 9.99, introTitle: 'Neon Dreams', introSubtitle: 'Vibrant neon color effects' },
  { id: 'new-2', name: 'Vintage Film', icon: '🎬', category: 'new', previewImage: getImage(11), creatorName: 'FilmGrain', likes: 890, isNew: true, price: 9.99, introTitle: 'Vintage Film', introSubtitle: 'Classic film grain look' },
  { id: 'new-3', name: 'Cyberpunk', icon: '🤖', category: 'new', previewImage: getImage(12), creatorName: 'CyberArt', likes: 2100, isNew: true, price: 9.99, introTitle: 'Cyberpunk', introSubtitle: 'Futuristic cyberpunk style' },

  // Winter
  { id: 'winter-1', name: 'Snow Queen', icon: '❄️', category: 'winter', previewImage: getImage(13), creatorName: 'FrostAI', likes: 34000, price: 9.99, introTitle: 'Snow Queen', introSubtitle: 'Icy winter transformation' },
  { id: 'winter-2', name: 'Cozy Cabin', icon: '🏔️', category: 'winter', previewImage: getImage(14), creatorName: 'WinterVibes', likes: 28000, price: 9.99, introTitle: 'Cozy Cabin', introSubtitle: 'Warm winter aesthetic' },
  { id: 'winter-3', name: 'Northern Lights', icon: '🌌', category: 'winter', previewImage: getImage(15), creatorName: 'AuroraAI', likes: 67000, price: 9.99, introTitle: 'Northern Lights', introSubtitle: 'Magical aurora effects' },

  // Popular
  { id: 'pop-1', name: 'Beauty Plus', icon: '💄', category: 'popular', previewImage: getImage(16), creatorName: 'BeautyAI', likes: 234000, price: 9.99, introTitle: 'Beauty Plus', introSubtitle: 'Enhance your natural beauty' },
  { id: 'pop-2', name: 'Age Filter', icon: '👶', category: 'popular', previewImage: getImage(17), creatorName: 'TimeLapse', likes: 567000, price: 9.99, introTitle: 'Age Filter', introSubtitle: 'See yourself at any age' },
  { id: 'pop-3', name: 'Hair Color', icon: '💇', category: 'popular', previewImage: getImage(18), creatorName: 'StyleLab', likes: 189000, price: 9.99, introTitle: 'Hair Color', introSubtitle: 'Try any hair color instantly' },
];

export const filterSections: FilterSection[] = [
  {
    id: 'trending',
    title: 'Viral Trends',
    filters: allFilters.filter(f => f.category === 'trending')
  },
  {
    id: 'pandora',
    title: 'Pandora',
    filters: allFilters.filter(f => f.category === 'pandora')
  },
  {
    id: 'viral',
    title: 'Viral Dances',
    filters: allFilters.filter(f => f.category === 'viral')
  },
  {
    id: 'new',
    title: 'New & Hot',
    filters: allFilters.filter(f => f.category === 'new')
  },
  {
    id: 'winter',
    title: 'Winter Collection',
    filters: allFilters.filter(f => f.category === 'winter')
  },
  {
    id: 'popular',
    title: 'Most Popular',
    filters: allFilters.filter(f => f.category === 'popular')
  }
];

export const getFilterById = (id: string): FilterConfig | undefined => {
  return allFilters.find(f => f.id === id);
};
