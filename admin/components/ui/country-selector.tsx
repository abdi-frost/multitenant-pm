'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

import { COUNTRIES, getCountryNameByCode, normalizeCountryCode } from '@/lib/countries'
import type { CountryOption } from '@/types/country'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

export type CountrySelectorProps = {
    value?: string | null
    onValueChange: (countryCode: string) => void
    disabled?: boolean
    placeholder?: string
    countries?: readonly CountryOption[]
}

export function CountrySelector({
    value,
    onValueChange,
    disabled,
    placeholder = 'Select a country',
    countries = COUNTRIES,
}: CountrySelectorProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')

    const selectedCode = normalizeCountryCode(value)
    const selectedName = getCountryNameByCode(selectedCode)

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return countries
        return countries.filter((c) => {
            return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
        })
    }, [countries, query])

    return (
        <DropdownMenu
            open={open}
            onOpenChange={(next) => {
                setOpen(next)
                if (!next) setQuery('')
            }}
        >
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                    disabled={disabled}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                >
                    <span className={cn('truncate', !selectedName && 'text-muted-foreground')}>
                        {selectedName ?? placeholder}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) p-2" sideOffset={6}>
                <div className="pb-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search country or code..."
                        disabled={disabled}
                        autoFocus
                    />
                </div>

                <ScrollArea className="h-64">
                    <div className="space-y-1">
                        {filtered.length === 0 ? (
                            <div className="text-muted-foreground px-2 py-2 text-sm">No results</div>
                        ) : (
                            filtered.map((c) => (
                                <DropdownMenuItem
                                    key={c.code}
                                    onSelect={(e) => {
                                        e.preventDefault()
                                        onValueChange(c.code)
                                        setOpen(false)
                                    }}
                                >
                                    <span className="flex flex-1 items-center justify-between gap-2">
                                        <span className="truncate">{c.name}</span>
                                        <span className="text-muted-foreground text-xs">{c.code}</span>
                                    </span>
                                    {selectedCode === c.code ? <Check className="ml-2 h-4 w-4" /> : null}
                                </DropdownMenuItem>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
