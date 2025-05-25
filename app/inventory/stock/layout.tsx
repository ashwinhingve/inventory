'use client';

import Layout from '@/components/ui/Layout';

export default function StockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
} 