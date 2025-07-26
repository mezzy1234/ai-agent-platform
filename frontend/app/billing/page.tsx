'use client';

import { useState } from 'react';
import NavBar from '../../components/NavBar';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-8 mt-4">
        <h1 className="text-2xl font-bold mb-4">Choose a Plan</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          <div className="border rounded-lg p-4 bg-white shadow flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Single Agent Plan</h3>
              <p className="text-gray-600 mb-4">Access one automation agent of your choice.</p>
              <p className="text-xl font-bold mb-4">$49/month</p>
            </div>
            <button
              disabled={loading}
              onClick={() => handleSubscribe('price_1_single')}
              className="bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 text-sm disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Subscribe'}
            </button>
          </div>
          <div className="border rounded-lg p-4 bg-white shadow flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Bundle Plan</h3>
              <p className="text-gray-600 mb-4">Get access to multiple agents and save.</p>
              <p className="text-xl font-bold mb-4">$199/month</p>
            </div>
            <button
              disabled={loading}
              onClick={() => handleSubscribe('price_1_bundle')}
              className="bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 text-sm disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Subscribe'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
