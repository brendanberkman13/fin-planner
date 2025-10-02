'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Transaction } from '@/types/accounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SpendingAnalysis() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllTransactions = async () => {
      setLoading(true);
      const accounts = await api.getAccounts();
      const allTransactions: Transaction[] = [];

      for (const account of accounts) {
        if (account.type !== 'investment') {
          const txns = await api.getTransactions(account.id);
          allTransactions.push(...txns);
        }
      }

      setTransactions(allTransactions);
      setLoading(false);
    };

    fetchAllTransactions();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getSpendingByPeriod = (period: 'day' | 'week' | 'month' | 'year') => {
    const now = new Date();
    const periodStart = new Date();

    switch (period) {
      case 'day':
        periodStart.setHours(0, 0, 0, 0);
        break;
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    const periodTransactions = transactions.filter(txn => {
      const txnDate = new Date(txn.date);
      return txnDate >= periodStart && txnDate <= now && txn.amount > 0; // amount > 0 means spending
    });

    const totalSpending = periodTransactions.reduce((sum, txn) => sum + txn.amount, 0);

    // Group by category
    const categorySpending: Record<string, number> = {};
    periodTransactions.forEach(txn => {
      const category = txn.category || 'Uncategorized';
      categorySpending[category] = (categorySpending[category] || 0) + txn.amount;
    });

    const categories = Object.entries(categorySpending)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Group by time period for chart
    const timeSeriesData: { date: string; amount: number }[] = [];

    if (period === 'day') {
      // Hourly breakdown for today
      for (let hour = 0; hour < 24; hour++) {
        const hourSpending = periodTransactions
          .filter(txn => new Date(txn.date).getHours() === hour)
          .reduce((sum, txn) => sum + txn.amount, 0);
        timeSeriesData.push({ date: `${hour}:00`, amount: hourSpending });
      }
    } else if (period === 'week') {
      // Daily breakdown for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        const daySpending = periodTransactions
          .filter(txn => new Date(txn.date).toDateString() === date.toDateString())
          .reduce((sum, txn) => sum + txn.amount, 0);
        timeSeriesData.push({ date: dateStr, amount: daySpending });
      }
    } else if (period === 'month') {
      // Daily breakdown for last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const daySpending = periodTransactions
          .filter(txn => new Date(txn.date).toDateString() === date.toDateString())
          .reduce((sum, txn) => sum + txn.amount, 0);
        timeSeriesData.push({ date: dateStr, amount: daySpending });
      }
    } else {
      // Monthly breakdown for last year
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        const monthSpending = periodTransactions
          .filter(txn => {
            const txnDate = new Date(txn.date);
            return txnDate.getMonth() === date.getMonth() && txnDate.getFullYear() === date.getFullYear();
          })
          .reduce((sum, txn) => sum + txn.amount, 0);
        timeSeriesData.push({ date: dateStr, amount: monthSpending });
      }
    }

    return { totalSpending, categories, transactionCount: periodTransactions.length, timeSeriesData };
  };

  const renderPeriodView = (period: 'day' | 'week' | 'month' | 'year', label: string) => {
    const { totalSpending, categories, transactionCount, timeSeriesData } = getSpendingByPeriod(period);

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Spending ({label})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(totalSpending)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {transactionCount} transactions
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
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average per Transaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(transactionCount > 0 ? totalSpending / transactionCount : 0)}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Spending Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {timeSeriesData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No spending data for this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      angle={period === 'month' ? -45 : 0}
                      textAnchor={period === 'month' ? 'end' : 'middle'}
                      height={period === 'month' ? 100 : 50}
                      className="text-xs"
                    />
                    <YAxis
                      tickFormatter={(value) => `$${value}`}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Category List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No spending data for this period
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map(({ name, amount }) => {
                  const percentage = ((amount / totalSpending) * 100).toFixed(1);
                  return (
                    <div key={name}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{name}</span>
                        <span className="text-sm font-semibold">{formatCurrency(amount)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {percentage}% of total spending
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return <div>Loading spending data...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="month" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="day">Daily</TabsTrigger>
          <TabsTrigger value="week">Weekly</TabsTrigger>
          <TabsTrigger value="month">Monthly</TabsTrigger>
          <TabsTrigger value="year">Yearly</TabsTrigger>
        </TabsList>

        <TabsContent value="day" className="mt-6">
          {renderPeriodView('day', 'Today')}
        </TabsContent>

        <TabsContent value="week" className="mt-6">
          {renderPeriodView('week', 'Last 7 Days')}
        </TabsContent>

        <TabsContent value="month" className="mt-6">
          {renderPeriodView('month', 'Last 30 Days')}
        </TabsContent>

        <TabsContent value="year" className="mt-6">
          {renderPeriodView('year', 'Last Year')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
