'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import airportsData from '@/data/airports.json'

interface Airport {
  slug: string
  name: string
  iata: string
  country: string
}

const airports = airportsData as Airport[]

export default function AirportSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered =
    query.trim().length === 0
      ? airports
      : airports.filter(
          (a) =>
            a.name.toLowerCase().includes(query.toLowerCase()) ||
            a.iata.toLowerCase().includes(query.toLowerCase()) ||
            a.country.toLowerCase().includes(query.toLowerCase())
        )

  const navigate = useCallback(
    (slug: string) => {
      setOpen(false)
      setQuery('')
      router.push(`/${slug}`)
    },
    [router]
  )

  useEffect(() => {
    setHighlighted(-1)
  }, [query])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return
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
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
          🔍
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Search by airport, city or IATA code…"
          aria-label="Search airports"
          aria-autocomplete="list"
          aria-expanded={open}
          className="w-full pl-12 pr-4 py-4 rounded-2xl text-slate-800 text-base shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 placeholder-slate-400"
        />
      </div>

      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-72 overflow-y-auto"
        >
          {filtered.map((airport, i) => (
            <li
              key={airport.slug}
              role="option"
              aria-selected={i === highlighted}
              onMouseDown={() => navigate(airport.slug)}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors ${
                i === highlighted ? 'bg-blue-50' : 'hover:bg-slate-50'
              }`}
            >
              <div>
                <span className="font-semibold text-slate-800 text-sm">{airport.name}</span>
                <span className="text-slate-400 text-xs ml-2">{airport.country}</span>
              </div>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-md">
                {airport.iata}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
