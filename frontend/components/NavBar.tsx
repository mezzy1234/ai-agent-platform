import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="w-full bg-white shadow-sm fixed top-0 left-0 z-10">
      <div className="max-w-5xl mx-auto flex justify-between items-center px-4 py-3">
        <Link href="/" className="text-xl font-semibold text-blue-600">
          AI Agent Platform
        </Link>
        <div className="space-x-4 text-sm">
          <Link href="/login" className="hover:text-blue-600">Login</Link>
          <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <Link href="/connect" className="hover:text-blue-600">Connect</Link>
          <Link href="/billing" className="hover:text-blue-600">Billing</Link>
        </div>
      </div>
    </nav>
  );
}
