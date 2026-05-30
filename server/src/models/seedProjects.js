// =========================================================
// Seed data — mirrors the four projects currently hard-coded
// in index.html so the API and the page stay in sync. Copy is
// preserved verbatim from the existing site.
// =========================================================
export const seedProjects = [
  {
    slug: 'stock-prediction-model',
    title: 'Stock Prediction Model',
    category: 'data',
    summary:
      'Regression-based forecasting of stock trends from historical market data. End-to-end EDA, feature prep, and decision-focused visualization.',
    description:
      'Regression-based forecasting of stock trends from historical market data. End-to-end EDA, feature prep, and decision-focused visualization.',
    stack: ['Python', 'Pandas', 'NumPy', 'Matplotlib'],
    liveUrl: null,
    sourceUrl: null,
    featured: true,
    order: 1
  },
  {
    slug: 'portfolio-website',
    title: 'Portfolio Website',
    category: 'web',
    summary:
      'Responsive, modern portfolio with a performance-first front-end architecture, clean component structure, and cross-device compatibility.',
    description:
      'Responsive, modern portfolio with a performance-first front-end architecture, clean component structure, and cross-device compatibility.',
    stack: ['HTML5', 'CSS3', 'JavaScript'],
    liveUrl: null,
    sourceUrl: null,
    featured: true,
    order: 2
  },
  {
    slug: 'fitness-tracker',
    title: 'Fitness Tracker',
    category: 'app',
    summary:
      'App to log workouts and track progress with persistent data and an intuitive interface.',
    description:
      'App to log workouts and track progress with persistent data and an intuitive interface.',
    stack: ['Python', 'JavaScript', 'HTML/CSS'],
    liveUrl: null,
    sourceUrl: null,
    featured: true,
    order: 3
  },
  {
    slug: 'dtm-drainage-network-analysis',
    title: 'DTM - Drainage Network Analysis',
    category: 'data',
    summary:
      'Digital Terrain Model simulating drainage flow paths over 1,000+ elevation points. Visualization-driven evaluation of network behavior.',
    description:
      'Digital Terrain Model simulating drainage flow paths over 1,000+ elevation points. Visualization-driven evaluation of network behavior.',
    stack: ['Python', 'Geospatial', 'Analysis'],
    liveUrl: null,
    sourceUrl: null,
    featured: true,
    order: 4
  }
];
