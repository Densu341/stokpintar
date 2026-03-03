'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return null;
  }

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          📊 StokPintar
        </Link>

        {user && (
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-4">
              <Link
                href="/dashboard"
                className="hover:bg-blue-700 px-3 py-2 rounded transition text-sm"
              >
                Dashboard
              </Link>
              <Link
                href="/upload"
                className="hover:bg-blue-700 px-3 py-2 rounded transition text-sm"
              >
                Upload
              </Link>
              <Link
                href="/insights"
                className="hover:bg-blue-700 px-3 py-2 rounded transition text-sm"
              >
                Insights
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm hidden md:inline">{user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded transition text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
