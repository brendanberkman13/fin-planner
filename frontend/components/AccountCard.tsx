'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Account } from '@/types/accounts';

interface AccountCardProps {
  account: Account;
  onDelete?: (id: string) => void;
}

export default function AccountCard({ account, onDelete }: AccountCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderTypeSpecificInfo = () => {
    // Credit Card
    if (account.type === 'credit' || account.subtype === 'credit card') {
      const utilization = account.credit_limit
        ? ((account.balance / account.credit_limit) * 100).toFixed(1)
        : null;

      return (
        <div className="space-y-2 mt-4">
          {account.credit_limit && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Credit Limit:</span>
                <span className="font-medium">{formatCurrency(account.credit_limit)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available:</span>
                <span className="font-medium">{formatCurrency(account.credit_limit - account.balance)}</span>
              </div>
              {utilization && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Utilization:</span>
                  <span className={`font-medium ${parseFloat(utilization) > 30 ? 'text-orange-600' : 'text-green-600'}`}>
                    {utilization}%
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    // Investment/Brokerage
    if (account.type === 'investment') {
      return (
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Portfolio Value:</span>
            <span className="font-medium">{formatCurrency(account.holdings_value || account.balance)}</span>
          </div>
        </div>
      );
    }

    // Checking/Savings
    if (account.type === 'depository' || account.subtype === 'checking' || account.subtype === 'savings') {
      return (
        <div className="space-y-2 mt-4">
          {account.available_balance !== undefined && account.available_balance !== account.balance && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Available:</span>
              <span className="font-medium">{formatCurrency(account.available_balance)}</span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div>
            <div className="text-lg font-semibold">{account.name}</div>
            <div className="text-sm text-muted-foreground">{account.institution}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
            <div className="text-sm text-muted-foreground capitalize">{account.subtype}</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderTypeSpecificInfo()}

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-muted-foreground">
            Last updated: {new Date(account.last_updated).toLocaleDateString()}
          </span>
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(account.id)}>
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
