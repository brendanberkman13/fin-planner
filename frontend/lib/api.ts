const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  // Plaid endpoints
  createLinkToken: async () => {
    const response = await fetch(`${API_URL}/api/plaid/create-link-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-1' }),
    });
    return response.json();
  },

  exchangePublicToken: async (publicToken: string) => {
    const response = await fetch(`${API_URL}/api/plaid/exchange-public-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_token: publicToken }),
    });
    return response.json();
  },

  // Account endpoints
  getAccounts: async () => {
    const response = await fetch(`${API_URL}/api/accounts`);
    return response.json();
  },

  getAccountById: async (id: string) => {
    const response = await fetch(`${API_URL}/api/accounts/${id}`);
    return response.json();
  },

  getTransactions: async (accountId: string) => {
    const response = await fetch(`${API_URL}/api/accounts/${accountId}/transactions`);
    return response.json();
  },

  getHoldings: async (accountId: string) => {
    const response = await fetch(`${API_URL}/api/accounts/${accountId}/holdings`);
    return response.json();
  },

  deleteAccount: async (id: string) => {
    const response = await fetch(`${API_URL}/api/accounts/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};