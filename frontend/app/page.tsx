'use client';

import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import SpendingAnalysis from '@/components/SpendingAnalysis';
import AccountOverview from '@/components/AccountOverview';
import Subscriptions from '@/components/Subscriptions';
import ThemeSelector from '@/components/ThemeSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { themes } from '@/lib/themes';

export default function Home() {
  const [currentTheme, setCurrentTheme] = useState('default');

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'default';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  };

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    localStorage.setItem('theme', themeId);
  };

  return (
    <>
      <ThemeSelector currentTheme={currentTheme} onThemeChange={handleThemeChange} />
      <main className="h-screen flex flex-col overflow-hidden p-8 pl-16">
        <div className="max-w-7xl mx-auto w-full flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
          <h1 className="text-4xl font-bold mb-8 flex-shrink-0">Financial Planner</h1>

        <Tabs defaultValue="overview" className="w-full flex-1 flex flex-col overflow-hidden">
          <TabsList className="flex-shrink-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="accounts">Your Accounts</TabsTrigger>
            <TabsTrigger value="spending">Spending</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 flex-1 overflow-auto">
            <AccountOverview />
          </TabsContent>

          <TabsContent value="accounts" className="mt-6 flex-1 overflow-hidden">
            <Dashboard />
          </TabsContent>

          <TabsContent value="spending" className="mt-6 flex-1 overflow-auto">
            <SpendingAnalysis />
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-6 flex-1 overflow-auto">
            <Subscriptions />
          </TabsContent>
        </Tabs>
      </div>
    </main>
    </>
  );
}
