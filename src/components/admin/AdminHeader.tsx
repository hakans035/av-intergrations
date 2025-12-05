'use client'

import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AdminHeaderProps {
  user: User
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <a href="/admin">
              <Image
                src="/av-logo-white.png"
                alt="Ambition Valley"
                width={160}
                height={40}
                className="h-7 md:h-8 w-auto"
                priority
              />
            </a>
            <nav className="hidden md:flex items-center gap-2">
              <a
                href="/admin"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/admin')
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Dashboard
              </a>
              <a
                href="/admin/submissions"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/admin/submissions')
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Inzendingen
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50 hidden sm:block">
              {user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
