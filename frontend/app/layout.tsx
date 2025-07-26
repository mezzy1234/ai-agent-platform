import '../globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'AI Agent Platform',
  description: 'Automation agents platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
