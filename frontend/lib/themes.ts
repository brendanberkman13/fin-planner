export interface Theme {
  id: string;
  name: string;
  color: string;
  isDark?: boolean;
  colors: {
    background: string;
    card: string;
    foreground: string;
    primary: string;
    accent: string;
    muted: string;
    border: string;
    'muted-foreground': string;
    'card-foreground': string;
  };
}

export const themes: Theme[] = [
  {
    id: 'default',
    name: 'Default',
    color: '#d4a5a5', // Pink/beige
    colors: {
      background: 'oklch(0.95 0.005 85)',
      card: 'oklch(0.98 0.004 85)',
      foreground: 'oklch(0.15 0 0)',
      primary: 'oklch(0.3 0 0)',
      accent: 'oklch(0.94 0.005 85)',
      muted: 'oklch(0.92 0.005 85)',
      border: 'oklch(0.88 0.005 85)',
      'muted-foreground': 'oklch(0.5 0 0)',
      'card-foreground': 'oklch(0.15 0 0)',
    },
  },
  {
    id: 'purple',
    name: 'Purple',
    color: '#8b5cf6', // Purple
    colors: {
      background: 'oklch(0.96 0.015 290)',
      card: 'oklch(0.98 0.01 290)',
      foreground: 'oklch(0.15 0 0)',
      primary: 'oklch(0.55 0.2 290)',
      accent: 'oklch(0.94 0.015 290)',
      muted: 'oklch(0.92 0.015 290)',
      border: 'oklch(0.88 0.015 290)',
      'muted-foreground': 'oklch(0.5 0 0)',
      'card-foreground': 'oklch(0.15 0 0)',
    },
  },
  {
    id: 'blue',
    name: 'Blue',
    color: '#3b82f6', // Blue
    colors: {
      background: 'oklch(0.96 0.015 240)',
      card: 'oklch(0.98 0.01 240)',
      foreground: 'oklch(0.15 0 0)',
      primary: 'oklch(0.55 0.2 240)',
      accent: 'oklch(0.94 0.015 240)',
      muted: 'oklch(0.92 0.015 240)',
      border: 'oklch(0.88 0.015 240)',
      'muted-foreground': 'oklch(0.5 0 0)',
      'card-foreground': 'oklch(0.15 0 0)',
    },
  },
  {
    id: 'green',
    name: 'Green',
    color: '#22c55e', // Green
    colors: {
      background: 'oklch(0.96 0.015 140)',
      card: 'oklch(0.98 0.01 140)',
      foreground: 'oklch(0.15 0 0)',
      primary: 'oklch(0.55 0.15 140)',
      accent: 'oklch(0.94 0.015 140)',
      muted: 'oklch(0.92 0.015 140)',
      border: 'oklch(0.88 0.015 140)',
      'muted-foreground': 'oklch(0.5 0 0)',
      'card-foreground': 'oklch(0.15 0 0)',
    },
  },
  {
    id: 'dark-slate',
    name: 'Dark Slate',
    color: '#1e293b', // Dark slate
    isDark: true,
    colors: {
      background: 'oklch(0.18 0.01 250)',
      card: 'oklch(0.22 0.01 250)',
      foreground: 'oklch(0.95 0 0)',
      primary: 'oklch(0.7 0.15 250)',
      accent: 'oklch(0.26 0.01 250)',
      muted: 'oklch(0.26 0.01 250)',
      border: 'oklch(0.3 0.01 250)',
      'muted-foreground': 'oklch(0.65 0 0)',
      'card-foreground': 'oklch(0.95 0 0)',
    },
  },
  {
    id: 'dark-purple',
    name: 'Dark Purple',
    color: '#581c87', // Dark purple
    isDark: true,
    colors: {
      background: 'oklch(0.18 0.05 290)',
      card: 'oklch(0.22 0.05 290)',
      foreground: 'oklch(0.95 0 0)',
      primary: 'oklch(0.65 0.25 290)',
      accent: 'oklch(0.26 0.05 290)',
      muted: 'oklch(0.26 0.05 290)',
      border: 'oklch(0.3 0.05 290)',
      'muted-foreground': 'oklch(0.65 0 0)',
      'card-foreground': 'oklch(0.95 0 0)',
    },
  },
  {
    id: 'dark-green',
    name: 'Dark Green',
    color: '#14532d', // Dark green
    isDark: true,
    colors: {
      background: 'oklch(0.18 0.04 140)',
      card: 'oklch(0.22 0.04 140)',
      foreground: 'oklch(0.95 0 0)',
      primary: 'oklch(0.65 0.2 140)',
      accent: 'oklch(0.26 0.04 140)',
      muted: 'oklch(0.26 0.04 140)',
      border: 'oklch(0.3 0.04 140)',
      'muted-foreground': 'oklch(0.65 0 0)',
      'card-foreground': 'oklch(0.95 0 0)',
    },
  },
  {
    id: 'dark-blue',
    name: 'Dark Blue',
    color: '#1e3a8a', // Dark blue
    isDark: true,
    colors: {
      background: 'oklch(0.18 0.05 240)',
      card: 'oklch(0.22 0.05 240)',
      foreground: 'oklch(0.95 0 0)',
      primary: 'oklch(0.65 0.25 240)',
      accent: 'oklch(0.26 0.05 240)',
      muted: 'oklch(0.26 0.05 240)',
      border: 'oklch(0.3 0.05 240)',
      'muted-foreground': 'oklch(0.65 0 0)',
      'card-foreground': 'oklch(0.95 0 0)',
    },
  },
];
