import Link from 'next/link';

export const Nav = () => (
  <nav className="bg-white shadow p-4 flex gap-4">
    <Link href="/dashboard" className="text-blue-600 font-semibold">Dashboard</Link>
    <Link href="/lectures" className="text-blue-600 font-semibold">Lectures</Link>
  </nav>
);
