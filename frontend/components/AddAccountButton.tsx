'use client';

import PlaidLink from './PlaidLink';
import { Button } from '@/components/ui/button';

interface AddAccountButtonProps {
  onAccountAdded: () => void;
}

export default function AddAccountButton({ onAccountAdded }: AddAccountButtonProps) {
  return (
    <PlaidLink onSuccess={onAccountAdded}>
      <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">+ Add Account</Button>
    </PlaidLink>
  );
}
