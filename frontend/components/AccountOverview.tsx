'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Account, Transaction } from '@/types/accounts';
import { api } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';

export default function AccountOverview() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [netWorthPeriod, setNetWorthPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const accountsData = await api.getAccounts();
    setAccounts(accountsData);

    // Load all transactions
    const allTransactions: Transaction[] = [];
    for (const account of accountsData) {
      const txns = await api.getTransactions(account.id);
      allTransactions.push(...txns);
    }
    setTransactions(allTransactions);
    setLoading(false);
  };

  // Calculate net worth
  const calculateNetWorth = () => {
    let assets = 0;
    let liabilities = 0;

    accounts.forEach(account => {
      if (account.type === 'depository' || account.type === 'investment') {
        assets += account.balance;
      } else if (account.type === 'credit') {
        liabilities += account.balance;
      }
    });

    return { assets, liabilities, netWorth: assets - liabilities };
  };

  // Calculate net worth over time
  const getNetWorthOverTime = (period: 'week' | 'month' | 'year') => {
    const data = [];
    const today = new Date();
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Calculate net worth at this date by subtracting spending from current net worth
      const spendingAfterDate = transactions
        .filter(t => new Date(t.date) > date && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const currentNetWorth = calculateNetWorth().netWorth;
      const netWorthAtDate = currentNetWorth + spendingAfterDate;

      data.push({
        date: period === 'year'
          ? date.toLocaleDateString('en-US', { month: 'short' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        netWorth: netWorthAtDate,
      });
    }

    return data;
  };

  // Calculate account allocation
  const getAccountAllocation = () => {
    const allocation: { [key: string]: number } = {};

    accounts.forEach(account => {
      const type = account.type === 'depository' ? 'Cash' :
                   account.type === 'investment' ? 'Investments' :
                   account.type === 'credit' ? 'Credit' : 'Other';

      if (!allocation[type]) allocation[type] = 0;
      allocation[type] += Math.abs(account.balance);
    });

    return Object.entries(allocation).map(([name, value]) => ({ name, value }));
  };

  // Calculate monthly cash flow (last 30 days)
  const getMonthlyCashFlow = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);

    const income = recentTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const expenses = recentTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expenses, cashFlow: income - expenses };
  };

  // Calculate spending by category (top 5)
  const getTopSpendingCategories = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = transactions.filter(t =>
      new Date(t.date) >= thirtyDaysAgo && t.amount > 0
    );

    const categoryTotals: { [key: string]: number } = {};

    recentTransactions.forEach(t => {
      const category = t.category || 'Other';
      if (!categoryTotals[category]) categoryTotals[category] = 0;
      categoryTotals[category] += t.amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const { assets, liabilities, netWorth } = calculateNetWorth();
  const netWorthData = getNetWorthOverTime(netWorthPeriod);
  const allocationData = getAccountAllocation();
  const topCategories = getTopSpendingCategories();
  const { income, expenses, cashFlow } = getMonthlyCashFlow();
  const debtToAssetRatio = assets > 0 ? (liabilities / assets * 100).toFixed(1) : '0';

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  if (loading) {
    return <div className="text-center py-8">Loading overview...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Net Worth</CardDescription>
              <CardTitle className="text-3xl">${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Assets: ${assets.toLocaleString()} | Debt: ${liabilities.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Monthly Cash Flow</CardDescription>
              <CardTitle className={`text-3xl ${cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(cashFlow).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Income: ${income.toLocaleString()} | Expenses: ${expenses.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Debt-to-Asset Ratio</CardDescription>
              <CardTitle className="text-3xl">{debtToAssetRatio}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {parseFloat(debtToAssetRatio) < 30 ? 'Healthy' : parseFloat(debtToAssetRatio) < 50 ? 'Moderate' : 'High'}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Savings Rate</CardDescription>
              <CardTitle className="text-3xl">
                {income > 0 ? ((cashFlow / income) * 100).toFixed(1) : '0'}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Last 30 days
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Net Worth Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Net Worth Over Time</CardTitle>
                <CardDescription>Track your wealth growth</CardDescription>
              </div>
              <Tabs value={netWorthPeriod} onValueChange={(v) => setNetWorthPeriod(v as 'week' | 'month' | 'year')}>
                <TabsList>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={netWorthData}>
                <defs>
                  <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
                <Area type="monotone" dataKey="netWorth" stroke="#10b981" fillOpacity={1} fill="url(#colorNetWorth)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Allocation and Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Account Allocation</CardTitle>
              <CardDescription>Distribution across account types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Spending Categories</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCategories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
