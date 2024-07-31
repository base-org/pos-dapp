'use client';
import { Suspense } from 'react';
import Payment from './payment';

export default function PaymentWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Payment />
    </Suspense>
  );
}
