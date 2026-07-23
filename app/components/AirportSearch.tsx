'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

interface AirportItem {
  slug: string
  name: string
  iata: string
  country: string
}

export default function AirportSearch({ airports }: { airports: AirportItem[] }) {
  const [mounted, setMounted] = useState(false)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const trimmed = query.trim()
  const hasEnoughChars = trimmed.length >= 3

  const filtered: AirportItem[] = hasEnoughChars
    ? airports.filter(
        (a) =>
          a.name.toLowerCase().includes(trimmed.toLowerCase()) ||
          a.iata.toLowerCase().includes(trimmed.toLowerCase()) ||
          a.country.toLowerCase().includes(trimmed.toLowerCase())
      )
    : []

  const showDropdown = mounted && open && hasEnoughChars && filtered.length > 0

  const navigate = useCallback(
    (slug: string) => {
      setOpen(false)
      setQuery('')
      const partner = searchParams.get('partner')
      router.push(partner ? `/${slug}?partner=${partner}` : `/${slug}`)
    },
    [router, searchParams]
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setHighlighted(-1)
  }, [query])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      if (highlighted >= 0 && filtered[highlighted]) {
        navigate(filtered[highlighted].slug)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const item = listRef.current.children[highlighted] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlighted])

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none stroke-[1.5]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Search by airport, city or IATA code…"
          aria-label="Search airports"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-slate-900 caret-slate-900 text-base shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 placeholder:text-slate-400 [&:-webkit-autofill]:[-webkit-text-fill-color:theme(colors.slate.900)] [&:-webkit-autofill]:[transition:background-color_9999s_ease]"
        />
      </div>

      {showDropdown && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-[9999] w-full mt-2 bg-slate-950 border border-gray-800 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden max-h-72 overflow-y-auto"
        >
          {filtered.map((airport, i) => (
            <li
              key={airport.slug}
              role="option"
              aria-selected={i === highlighted}
              onMouseDown={(e) => {
                e.preventDefault()
                navigate(airport.slug)
              }}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors ${
                i === highlighted
                  ? 'bg-slate-800'
                  : 'hover:bg-slate-800'
              }`}
            >
              <div>
                <span className="font-semibold text-white text-sm">{airport.name}</span>
                <span className="text-slate-400 text-xs ml-2">{airport.country}</span>
              </div>
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-md ml-3 shrink-0">
                {airport.iata}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
