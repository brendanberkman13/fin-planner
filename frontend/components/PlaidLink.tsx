'use client';

import { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { api } from '@/lib/api';

interface PlaidLinkProps {
  onSuccess: () => void;
  children: React.ReactNode;
}

export default function PlaidLink({ onSuccess, children }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  useEffect(() => {
    const createLinkToken = async () => {
      try {
        console.log('Requesting link token from backend...');
        const data = await api.createLinkToken();
        console.log('Link token received:', data.link_token?.substring(0, 20) + '...');
        setLinkToken(data.link_token);
      } catch (error) {
        console.error('Error creating link token:', error);
      }
    };
    createLinkToken();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken) => {
      // Exchange public token for access token
      await api.exchangePublicToken(publicToken);
      onSuccess();
    },
    onExit: (err, metadata) => {
      console.error('Plaid Link exited:', err, metadata);
    },
  });

  return (
    <div onClick={() => ready && open()}>
      {children}
    </div>
  );
}
