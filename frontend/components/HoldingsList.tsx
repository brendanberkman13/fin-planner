'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Holding } from '@/types/accounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HoldingsListProps {
  accountId: string;
  accountName: string;
  onClose: () => void;
}

export default function HoldingsList({ accountId, accountName, onClose }: HoldingsListProps) {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'value' | 'gain' | 'name'>('value');

  useEffect(() => {
    const fetchHoldings = async () => {
      setLoading(true);
      const data = await api.getHoldings(accountId);
      setHoldings(data);
      setLoading(false);
    };
    fetchHoldings();
  }, [accountId]);

  // Filter and sort holdings
  const filteredAndSortedHoldings = holdings
    .filter(holding =>
      holding.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      holding.ticker?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'value') return b.value - a.value;
      if (sortBy === 'gain') {
        const gainA = a.value - (a.cost_basis || a.value);
        const gainB = b.value - (b.cost_basis || b.value);
        return gainB - gainA;
      }
      return a.name.localeCompare(b.name);
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
  const totalCostBasis = holdings.reduce((sum, holding) => sum + (holding.cost_basis || 0), 0);
  const totalGainLoss = totalValue - totalCostBasis;
  const totalGainLossPercent = totalCostBasis > 0 ? ((totalGainLoss / totalCostBasis) * 100).toFixed(2) : '0.00';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      <Card className="flex flex-col h-full">
        <CardHeader className="flex-shrink-0">
          <div className="flex justify-between items-center">
            <CardTitle>Holdings - {accountName}</CardTitle>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          {loading ? (
            <div>Loading holdings...</div>
          ) : holdings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No holdings found
            </div>
          ) : (
            <>
              {/* Summary - Fixed at top */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-lg flex-shrink-0">
                <div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                  <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Gain/Loss</div>
                  <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Return</div>
                  <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercent}%
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4 mb-4 flex-shrink-0">
                <Input
                  placeholder="Search holdings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Select value={sortBy} onValueChange={(value: 'value' | 'gain' | 'name') => setSortBy(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="value">Sort by Value</SelectItem>
                    <SelectItem value="gain">Sort by Gain/Loss</SelectItem>
                    <SelectItem value="name">Sort by Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Holdings List - Scrollable */}
              <div className="space-y-2 overflow-y-auto flex-1">
                {filteredAndSortedHoldings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No holdings match your search
                  </div>
                ) : (
                  filteredAndSortedHoldings.map((holding) => {
                  const gainLoss = holding.value - (holding.cost_basis || holding.value);
                  const gainLossPercent = holding.cost_basis
                    ? ((gainLoss / holding.cost_basis) * 100).toFixed(2)
                    : '0.00';

                  return (
                    <div
                      key={holding.id}
                      className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{holding.name}</div>
                        {holding.ticker && (
                          <div className="text-sm text-muted-foreground">{holding.ticker}</div>
                        )}
                        <div className="text-sm text-muted-foreground mt-1">
                          {holding.quantity.toFixed(4)} shares @ {formatCurrency(holding.price)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(holding.value)}</div>
                        {holding.cost_basis && (
                          <div className={`text-sm ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)} ({gainLoss >= 0 ? '+' : ''}{gainLossPercent}%)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                  })
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}