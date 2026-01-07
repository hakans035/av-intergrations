'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/admin/seo-engine',
    label: 'Overzicht',
    description: 'Webflow posts beheren',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/admin/seo-engine/queue',
    label: 'Keyword Queue',
    description: 'Ontdek en beheer keywords',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    href: '/admin/seo-engine/generate',
    label: 'Genereren',
    description: 'Nieuwe blog genereren',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    href: '/admin/seo-engine/drafts',
    label: 'Drafts',
    description: 'Review en publiceer blogs',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
]

export function SEONavDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    // Use setTimeout to avoid immediate triggering
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  // Get current page label
  const currentPage = navItems.find(item =>
    pathname === item.href ||
    (item.href !== '/admin/seo-engine' && pathname.startsWith(item.href))
  ) || navItems[0]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium text-white transition-all duration-200 flex items-center gap-2"
      >
        {currentPage.icon}
        <span>{currentPage.label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 py-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-50 animate-fade-in-up">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin/seo-engine' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block w-full cursor-pointer`}
              >
                <div className={`flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${
                  isActive ? 'bg-white/10' : ''
                }`}>
                <div className={`mt-0.5 ${isActive ? 'text-green-400' : 'text-white/60'}`}>
                  {item.icon}
                </div>
                <div>
                  <div className={`font-medium ${isActive ? 'text-white' : 'text-white/80'}`}>
                    {item.label}
                  </div>
                  <div className="text-xs text-white/50">{item.description}</div>
                </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
