/**
 * Crop Database
 * Contains comprehensive information about various crops
 */

export interface CropInfo {
  id: string;
  name: string;
  scientificName: string;
  category: 'cereals' | 'vegetables' | 'fruits' | 'legumes' | 'cash_crops' | 'fodder';
  varieties: string[];
  climate: {
    zones: string[];
    temperature: { min: number; max: number; optimal: { min: number; max: number } };
    rainfall: { min: number; max: number; optimal: { min: number; max: number } };
    humidity: { min: number; max: number; optimal: { min: number; max: number } };
  };
  soil: {
    types: string[];
    ph: { min: number; max: number; optimal: { min: number; max: number } };
    drainage: 'poor' | 'moderate' | 'good' | 'excellent';
  };
  season: {
    planting: string[];
    duration: number; // days
    harvest: string[];
  };
  requirements: {
    sunlight: 'full' | 'partial' | 'shade';
    water: 'low' | 'moderate' | 'high';
    fertilizer: 'low' | 'moderate' | 'high';
  };
  benefits: string[];
  commonChallenges: string[];
  nutritionalValue?: {
    calories: number;
    protein: number;
    carbs: number;
    fiber: number;
    vitamins: string[];
  };
}

export const CROP_DATABASE: CropInfo[] = [
  {
    id: 'maize',
    name: 'Maize (Corn)',
    scientificName: 'Zea mays',
    category: 'cereals',
    varieties: ['Sweet Corn', 'Dent Corn', 'Flint Corn', 'Popcorn'],
    climate: {
      zones: ['tropical', 'subtropical', 'temperate'],
      temperature: { min: 15, max: 35, optimal: { min: 18, max: 27 } },
      rainfall: { min: 500, max: 1200, optimal: { min: 600, max: 1000 } },
      humidity: { min: 40, max: 80, optimal: { min: 50, max: 70 } },
    },
    soil: {
      types: ['loamy', 'sandy-loam', 'clay-loam'],
      ph: { min: 5.5, max: 7.5, optimal: { min: 6.0, max: 7.0 } },
      drainage: 'good',
    },
    season: {
      planting: ['spring', 'early-summer'],
      duration: 90,
      harvest: ['late-summer', 'early-autumn'],
    },
    requirements: {
      sunlight: 'full',
      water: 'moderate',
      fertilizer: 'moderate',
    },
    benefits: [
      'High yield potential',
      'Good source of carbohydrates',
      'Multiple uses (food, feed, industrial)',
      'Relatively drought tolerant',
    ],
    commonChallenges: [
      'Susceptible to corn borer',
      'Requires good soil fertility',
      'Sensitive to waterlogging',
      'May need irrigation in dry areas',
    ],
  },
  {
    id: 'rice',
    name: 'Rice',
    scientificName: 'Oryza sativa',
    category: 'cereals',
    varieties: ['Basmati', 'Jasmine', 'Arborio', 'Brown Rice'],
    climate: {
      zones: ['tropical', 'subtropical'],
      temperature: { min: 20, max: 35, optimal: { min: 22, max: 30 } },
      rainfall: { min: 1000, max: 2500, optimal: { min: 1200, max: 2000 } },
      humidity: { min: 60, max: 90, optimal: { min: 70, max: 85 } },
    },
    soil: {
      types: ['clay', 'clay-loam', 'silty-clay'],
      ph: { min: 5.0, max: 8.0, optimal: { min: 6.0, max: 7.0 } },
      drainage: 'poor',
    },
    season: {
      planting: ['summer', 'monsoon'],
      duration: 120,
      harvest: ['autumn', 'winter'],
    },
    requirements: {
      sunlight: 'full',
      water: 'high',
      fertilizer: 'high',
    },
    benefits: [
      'Staple food crop',
      'High caloric value',
      'Grows in flooded conditions',
      'Multiple harvests per year possible',
    ],
    commonChallenges: [
      'Requires standing water',
      'Susceptible to blast disease',
      'Labor intensive',
      'Methane emissions',
    ],
  },
  {
    id: 'wheat',
    name: 'Wheat',
    scientificName: 'Triticum aestivum',
    category: 'cereals',
    varieties: ['Hard Red Winter', 'Soft Red Winter', 'Hard Red Spring', 'Durum'],
    climate: {
      zones: ['temperate', 'subtropical'],
      temperature: { min: 10, max: 25, optimal: { min: 12, max: 22 } },
      rainfall: { min: 300, max: 1000, optimal: { min: 400, max: 800 } },
      humidity: { min: 30, max: 70, optimal: { min: 40, max: 60 } },
    },
    soil: {
      types: ['loamy', 'clay-loam', 'sandy-loam'],
      ph: { min: 6.0, max: 7.5, optimal: { min: 6.5, max: 7.0 } },
      drainage: 'good',
    },
    season: {
      planting: ['autumn', 'winter'],
      duration: 150,
      harvest: ['spring', 'early-summer'],
    },
    requirements: {
      sunlight: 'full',
      water: 'moderate',
      fertilizer: 'moderate',
    },
    benefits: [
      'High protein content',
      'Good storage life',
      'Cool season crop',
      'Multiple end uses',
    ],
    commonChallenges: [
      'Susceptible to rust diseases',
      'Requires cool, dry harvest',
      'Competition from weeds',
      'Aphid infestations',
    ],
  },
  {
    id: 'tomato',
    name: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    category: 'vegetables',
    varieties: ['Cherry', 'Roma', 'Beefsteak', 'Heirloom'],
    climate: {
      zones: ['tropical', 'subtropical', 'temperate'],
      temperature: { min: 15, max: 30, optimal: { min: 18, max: 25 } },
      rainfall: { min: 400, max: 800, optimal: { min: 500, max: 700 } },
      humidity: { min: 40, max: 70, optimal: { min: 50, max: 65 } },
    },
    soil: {
      types: ['loamy', 'sandy-loam'],
      ph: { min: 6.0, max: 7.0, optimal: { min: 6.2, max: 6.8 } },
      drainage: 'good',
    },
    season: {
      planting: ['spring', 'early-summer'],
      duration: 75,
      harvest: ['summer', 'early-autumn'],
    },
    requirements: {
      sunlight: 'full',
      water: 'moderate',
      fertilizer: 'high',
    },
    benefits: [
      'High vitamin C content',
      'Versatile culinary uses',
      'Good market value',
      'Continuous harvest',
    ],
    commonChallenges: [
      'Susceptible to blight',
      'Requires support structures',
      'Sensitive to frost',
      'Pest management needed',
    ],
  },
  {
    id: 'beans',
    name: 'Beans',
    scientificName: 'Phaseolus vulgaris',
    category: 'legumes',
    varieties: ['Navy Beans', 'Kidney Beans', 'Black Beans', 'Green Beans'],
    climate: {
      zones: ['tropical', 'subtropical', 'temperate'],
      temperature: { min: 15, max: 30, optimal: { min: 18, max: 25 } },
      rainfall: { min: 400, max: 1000, optimal: { min: 500, max: 800 } },
      humidity: { min: 40, max: 75, optimal: { min: 50, max: 70 } },
    },
    soil: {
      types: ['loamy', 'sandy-loam', 'clay-loam'],
      ph: { min: 6.0, max: 7.5, optimal: { min: 6.2, max: 7.0 } },
      drainage: 'good',
    },
    season: {
      planting: ['spring', 'summer'],
      duration: 60,
      harvest: ['summer', 'autumn'],
    },
    requirements: {
      sunlight: 'full',
      water: 'moderate',
      fertilizer: 'low',
    },
    benefits: [
      'Nitrogen fixation',
      'High protein content',
      'Improves soil fertility',
      'Quick maturity',
    ],
    commonChallenges: [
      'Susceptible to bacterial blight',
      'Sensitive to waterlogging',
      'Aphid problems',
      'Requires good drainage',
    ],
  },
  {
    id: 'potato',
    name: 'Potato',
    scientificName: 'Solanum tuberosum',
    category: 'vegetables',
    varieties: ['Russet', 'Red', 'Fingerling', 'Sweet Potato'],
    climate: {
      zones: ['temperate', 'subtropical'],
      temperature: { min: 10, max: 25, optimal: { min: 15, max: 20 } },
      rainfall: { min: 400, max: 800, optimal: { min: 500, max: 700 } },
      humidity: { min: 40, max: 80, optimal: { min: 50, max: 70 } },
    },
    soil: {
      types: ['sandy-loam', 'loamy'],
      ph: { min: 5.0, max: 7.0, optimal: { min: 5.5, max: 6.5 } },
      drainage: 'excellent',
    },
    season: {
      planting: ['spring', 'early-summer'],
      duration: 90,
      harvest: ['late-summer', 'autumn'],
    },
    requirements: {
      sunlight: 'full',
      water: 'moderate',
      fertilizer: 'moderate',
    },
    benefits: [
      'High yield per area',
      'Good source of starch',
      'Storage crop',
      'Multiple varieties',
    ],
    commonChallenges: [
      'Late blight susceptibility',
      'Colorado potato beetle',
      'Requires hilling',
      'Storage management',
    ],
  },
];

export const getCropById = (id: string): CropInfo | undefined => {
  return CROP_DATABASE.find(crop => crop.id === id);
};

export const getCropsByCategory = (category: CropInfo['category']): CropInfo[] => {
  return CROP_DATABASE.filter(crop => crop.category === category);
};

export const searchCrops = (query: string): CropInfo[] => {
  const lowercaseQuery = query.toLowerCase();
  return CROP_DATABASE.filter(crop => 
    crop.name.toLowerCase().includes(lowercaseQuery) ||
    crop.scientificName.toLowerCase().includes(lowercaseQuery) ||
    crop.varieties.some(variety => variety.toLowerCase().includes(lowercaseQuery))
  );
};
