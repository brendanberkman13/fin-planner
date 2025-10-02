'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Account } from '@/types/accounts';
import AddAccountButton from './AddAccountButton';
import TransactionsList from './TransactionsList';
import HoldingsList from './HoldingsList';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterInstitution, setFilterInstitution] = useState<string>('all');

  const fetchAccounts = async () => {
    setLoading(true);
    const data = await api.getAccounts();
    setAccounts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAccountAdded = () => {
    fetchAccounts();
  };

  const handleDeleteAccount = async (id: string) => {
    await api.deleteAccount(id);
    setSelectedAccount(null);
    fetchAccounts();
  };

  const handleAccountClick = (account: Account) => {
    console.log('Account clicked:', account.name, 'Type:', account.type, 'Subtype:', account.subtype);
    setSelectedAccount(account);
  };

  const isInvestmentAccount = (account: Account) => {
    const isInvestment = account.type === 'investment';
    console.log('Checking if investment:', account.name, 'Type:', account.type, 'Result:', isInvestment);
    return isInvestment;
  };

  // Get unique account types and institutions
  const accountTypes = Array.from(new Set(accounts.map(a => a.type)));
  const institutions = Array.from(new Set(accounts.map(a => a.institution)));

  // Filter accounts based on selected filters
  const filteredAccounts = accounts.filter(account => {
    const matchesType = filterType === 'all' || account.type === filterType;
    const matchesInstitution = filterInstitution === 'all' || account.institution === filterInstitution;
    return matchesType && matchesInstitution;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {selectedAccount ? (
        isInvestmentAccount(selectedAccount) ? (
          <HoldingsList
            accountId={selectedAccount.id}
            accountName={selectedAccount.name}
            onClose={() => setSelectedAccount(null)}
          />
        ) : (
          <TransactionsList
            accountId={selectedAccount.id}
            accountName={selectedAccount.name}
            onClose={() => setSelectedAccount(null)}
          />
        )
      ) : accounts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No accounts connected yet. Click Add Account to get started.
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex justify-between items-end mb-4">
            <div className="flex gap-4 items-end">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Account Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {accountTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Institution</label>
                <Select value={filterInstitution} onValueChange={setFilterInstitution}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Institutions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Institutions</SelectItem>
                    {institutions.map(institution => (
                      <SelectItem key={institution} value={institution}>
                        {institution}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(filterType !== 'all' || filterInstitution !== 'all') && (
                <button
                  onClick={() => {
                    setFilterType('all');
                    setFilterInstitution('all');
                  }}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
            <AddAccountButton onAccountAdded={handleAccountAdded} />
          </div>

          {/* Accounts List */}
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No accounts match the selected filters.
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden flex flex-col max-h-full">
              <div className="bg-muted/50 px-6 py-3 grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground">
                <div>Institution</div>
                <div>Account</div>
                <div>Type</div>
                <div className="text-right">Balance</div>
                <div className="text-right">Actions</div>
              </div>
              <div className="divide-y divide-border overflow-y-auto">
                {filteredAccounts.map((account, index) => (
                  <motion.div
                    key={`${account.id}-${filterType}-${filterInstitution}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleAccountClick(account)}
                    className="px-6 py-4 grid grid-cols-5 gap-4 items-center hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <div className="font-medium">{account.institution}</div>
                    <div>{account.name}</div>
                    <div className="capitalize text-sm text-muted-foreground">
                      {account.type === 'depository' ? 'Cash' :
                       account.type === 'investment' ? 'Investment' :
                       account.type === 'credit' ? 'Credit' : account.type}
                    </div>
                    <div className="text-right font-semibold">
                      ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAccount(account.id);
                        }}
                        className="text-sm text-destructive hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
