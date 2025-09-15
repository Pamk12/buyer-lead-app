'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Disclosure } from '@headlessui/react';
import { City, Status, PropertyType, Bhk, Purpose, Timeline, Source } from "@prisma/client";
import { useState, useEffect } from 'react';

export function Filters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // --- State for controlled components ---
  const [search, setSearch] = useState(searchParams.get('search')?.toString() || '');
  const [status, setStatus] = useState(searchParams.get('status')?.toString() || '');
  const [city, setCity] = useState(searchParams.get('city')?.toString() || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType')?.toString() || '');
  const [bhk, setBhk] = useState(searchParams.get('bhk')?.toString() || '');
  const [purpose, setPurpose] = useState(searchParams.get('purpose')?.toString() || '');
  const [timeline, setTimeline] = useState(searchParams.get('timeline')?.toString() || '');
  const [source, setSource] = useState(searchParams.get('source')?.toString() || '');

  // Effect to update local state when URL search params change (e.g., back/forward navigation)
  useEffect(() => {
    setSearch(searchParams.get('search')?.toString() || '');
    setStatus(searchParams.get('status')?.toString() || '');
    setCity(searchParams.get('city')?.toString() || '');
    setPropertyType(searchParams.get('propertyType')?.toString() || '');
    setBhk(searchParams.get('bhk')?.toString() || '');
    setPurpose(searchParams.get('purpose')?.toString() || '');
    setTimeline(searchParams.get('timeline')?.toString() || '');
    setSource(searchParams.get('source')?.toString() || '');
  }, [searchParams]);

  const handleFilterChange = useDebouncedCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const clearFilters = () => {
    // Also reset all local states to visually clear the inputs
    setSearch('');
    setStatus('');
    setCity('');
    setPropertyType('');
    setBhk('');
    setPurpose('');
    setTimeline('');
    setSource('');
    replace(pathname);
  };
  
  const hasActiveFilters = searchParams.size > 0 && !(searchParams.size === 1 && searchParams.has('page'));

  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
                <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-1">Search</label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        id="search"
                        type="text"
                        placeholder="Name, email, or phone..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            handleFilterChange('search', e.target.value);
                        }}
                        className="block w-full rounded-md border-slate-300 pl-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    />
                </div>
            </div>
            <FilterSelect
                label="Status"
                name="status"
                value={status}
                onChange={(e) => {
                    setStatus(e.target.value);
                    handleFilterChange('status', e.target.value);
                }}
            >
                {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
            </FilterSelect>
            <FilterSelect
                label="City"
                name="city"
                value={city}
                onChange={(e) => {
                    setCity(e.target.value);
                    handleFilterChange('city', e.target.value);
                }}
            >
                {Object.values(City).map(c => <option key={c} value={c}>{c}</option>)}
            </FilterSelect>
        </div>

        <Disclosure as="div" className="mt-4">
          {({ open }: { open: boolean }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between rounded-lg bg-slate-100 px-4 py-2 text-left text-sm font-medium text-slate-900 hover:bg-slate-200 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75">
                <span>Advanced Filters</span>
                <ChevronUpIcon className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-slate-500 transition-transform`} />
              </Disclosure.Button>
              <Disclosure.Panel as="div" className="px-4 pt-4 pb-2 text-sm text-gray-500 border border-t-0 rounded-b-lg border-slate-200 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FilterSelect label="Property Type" name="propertyType" value={propertyType} onChange={(e) => { setPropertyType(e.target.value); handleFilterChange('propertyType', e.target.value); }}>
                        {Object.values(PropertyType).map(pt => <option key={pt} value={pt}>{pt}</option>)}
                    </FilterSelect>
                    <FilterSelect label="BHK" name="bhk" value={bhk} onChange={(e) => { setBhk(e.target.value); handleFilterChange('bhk', e.target.value); }}>
                        {Object.values(Bhk).map(bhk => <option key={bhk} value={bhk}>{bhk}</option>)}
                    </FilterSelect>
                    <FilterSelect label="Purpose" name="purpose" value={purpose} onChange={(e) => { setPurpose(e.target.value); handleFilterChange('purpose', e.target.value); }}>
                        {Object.values(Purpose).map(p => <option key={p} value={p}>{p}</option>)}
                    </FilterSelect>
                    <FilterSelect label="Timeline" name="timeline" value={timeline} onChange={(e) => { setTimeline(e.target.value); handleFilterChange('timeline', e.target.value); }}>
                        {Object.values(Timeline).map(t => <option key={t} value={t}>{t}</option>)}
                    </FilterSelect>
                    <FilterSelect label="Source" name="source" value={source} onChange={(e) => { setSource(e.target.value); handleFilterChange('source', e.target.value); }}>
                        {Object.values(Source).map(s => <option key={s} value={s}>{s}</option>)}
                    </FilterSelect>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
        
        {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
                <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                    <XCircleIcon className="h-5 w-5" />
                    Clear All Filters
                </button>
            </div>
        )}
    </div>
  );
}

function FilterSelect({ label, name, value, onChange, children }: { label: string, name: string, value?: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode }) {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <select
                id={name}
                name={name}
                value={value || ""}
                onChange={onChange}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
            >
                <option value="">All</option>
                {children}
            </select>
        </div>
    );
}

// --- SVG Icon Components ---
function ChevronUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06 0L10 9.06l-3.71 3.73a.75.75 0 11-1.06-1.06l4.24-4.25a.75.75 0 011.06 0l4.24 4.25a.75.75 0 010 1.06z" clipRule="evenodd" />
    </svg>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
        </svg>
    );
}

function XCircleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        </svg>
    );
}

