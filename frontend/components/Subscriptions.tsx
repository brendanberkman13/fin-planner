'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/accounts';
import { api } from '@/lib/api';

interface Subscription {
  name: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastCharge: string;
  nextEstimated: string;
  occurrences: number;
  transactions: Transaction[];
}

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    const accounts = await api.getAccounts();
    const allTransactions: Transaction[] = [];

    for (const account of accounts) {
      const txns = await api.getTransactions(account.id);
      allTransactions.push(...txns);
    }

    const detected = detectSubscriptions(allTransactions);
    setSubscriptions(detected);
    setLoading(false);
  };

  const detectSubscriptions = (transactions: Transaction[]): Subscription[] => {
    // Only look at expenses (positive amounts)
    const expenses = transactions.filter(t => t.amount > 0);

    // Group by similar description (normalize descriptions)
    const groups: { [key: string]: Transaction[] } = {};

    expenses.forEach(txn => {
      const normalized = normalizeDescription(txn.description);
      if (!groups[normalized]) groups[normalized] = [];
      groups[normalized].push(txn);
    });

    const subscriptions: Subscription[] = [];

    // Analyze each group for recurring patterns
    Object.entries(groups).forEach(([name, txns]) => {
      if (txns.length < 2) return; // Need at least 2 occurrences

      // Sort by date
      txns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Check if amounts are similar
      const amounts = txns.map(t => t.amount);
      const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      const maxDiff = Math.max(...amounts) - Math.min(...amounts);

      // If amounts vary too much (more than 20%), likely not a subscription
      if (maxDiff > avgAmount * 0.2) return;

      // Calculate intervals between transactions
      const intervals: number[] = [];
      for (let i = 1; i < txns.length; i++) {
        const days = Math.floor(
          (new Date(txns[i].date).getTime() - new Date(txns[i - 1].date).getTime()) /
          (1000 * 60 * 60 * 24)
        );
        intervals.push(days);
      }

      const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;

      // Determine frequency based on average interval
      let frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null = null;

      if (avgInterval >= 5 && avgInterval <= 9) frequency = 'weekly';
      else if (avgInterval >= 25 && avgInterval <= 35) frequency = 'monthly';
      else if (avgInterval >= 85 && avgInterval <= 95) frequency = 'quarterly';
      else if (avgInterval >= 350 && avgInterval <= 380) frequency = 'yearly';

      if (!frequency) return; // Not a recognizable pattern

      // Calculate next estimated charge
      const lastCharge = txns[txns.length - 1].date;
      const nextEstimated = new Date(lastCharge);

      if (frequency === 'weekly') nextEstimated.setDate(nextEstimated.getDate() + 7);
      else if (frequency === 'monthly') nextEstimated.setMonth(nextEstimated.getMonth() + 1);
      else if (frequency === 'quarterly') nextEstimated.setMonth(nextEstimated.getMonth() + 3);
      else if (frequency === 'yearly') nextEstimated.setFullYear(nextEstimated.getFullYear() + 1);

      subscriptions.push({
        name,
        amount: avgAmount,
        frequency,
        lastCharge,
        nextEstimated: nextEstimated.toISOString().split('T')[0],
        occurrences: txns.length,
        transactions: txns,
      });
    });

    // Sort by amount (highest first)
    return subscriptions.sort((a, b) => b.amount - a.amount);
  };

  const normalizeDescription = (description: string): string => {
    // Remove common words, numbers, dates, and normalize
    return description
      .toLowerCase()
      .replace(/\d+/g, '') // Remove numbers
      .replace(/\b(payment|bill|autopay|recurring)\b/g, '') // Remove common words
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  };

  const getFrequencyLabel = (frequency: string): string => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  const getTotalMonthly = (): number => {
    return subscriptions.reduce((sum, sub) => {
      if (sub.frequency === 'weekly') return sum + sub.amount * 4.33;
      if (sub.frequency === 'monthly') return sum + sub.amount;
      if (sub.frequency === 'quarterly') return sum + sub.amount / 3;
      if (sub.frequency === 'yearly') return sum + sub.amount / 12;
      return sum;
    }, 0);
  };

  const getTotalYearly = (): number => {
    return subscriptions.reduce((sum, sub) => {
      if (sub.frequency === 'weekly') return sum + sub.amount * 52;
      if (sub.frequency === 'monthly') return sum + sub.amount * 12;
      if (sub.frequency === 'quarterly') return sum + sub.amount * 4;
      if (sub.frequency === 'yearly') return sum + sub.amount;
      return sum;
    }, 0);
  };

  if (loading) {
    return <div className="text-center py-8">Detecting subscriptions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Subscriptions</CardDescription>
              <CardTitle className="text-3xl">{subscriptions.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Detected recurring payments
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
              <CardDescription>Monthly Total</CardDescription>
              <CardTitle className="text-3xl">
                ${getTotalMonthly().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Estimated monthly cost
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
              <CardDescription>Yearly Total</CardDescription>
              <CardTitle className="text-3xl">
                ${getTotalYearly().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Estimated yearly cost
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Subscriptions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Detected Subscriptions</CardTitle>
            <CardDescription>Recurring charges identified from your transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recurring subscriptions detected. Add more transactions to improve detection.
              </div>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((sub, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{sub.name}</h3>
                      <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{getFrequencyLabel(sub.frequency)}</span>
                        <span>•</span>
                        <span>{sub.occurrences} charges detected</span>
                        <span>•</span>
                        <span>Last: {new Date(sub.lastCharge).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Next: {new Date(sub.nextEstimated).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        ${sub.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        per {sub.frequency === 'yearly' ? 'year' : sub.frequency === 'quarterly' ? 'quarter' : 'month'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
