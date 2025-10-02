'use client';

import { themes } from '@/lib/themes';

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

export default function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="fixed left-0 top-0 h-screen w-8 flex flex-col z-50">
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onThemeChange(theme.id)}
          className={`flex-1 transition-all hover:w-10 cursor-pointer ${
            currentTheme === theme.id ? 'w-10' : 'w-8'
          }`}
          style={{ backgroundColor: theme.color }}
          title={theme.name}
          aria-label={`Switch to ${theme.name} theme`}
        />
      ))}
    </div>
  );
}
