import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from 'next/navigation';
import { auth } from "@/auth";

import { BuyerTable } from "../../components/buyer-table";
import { Filters } from "../../components/filters";
import { PaginationControls } from "../../components/pagination-controls";
import { ImportExportControls } from "../../components/import-export";

type Props = {
  searchParams: {
    page?: string;
    search?: string;
    city?: string;
    propertyType?: string;
    status?: string;
    timeline?: string;
    bhk?: string;
    purpose?: string;
    source?: string;
  };
};

async function getPaginatedBuyers(searchParams: Props['searchParams']) {
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = 10;
  const search = searchParams.search || "";

  const filterableFields = ['city', 'propertyType', 'status', 'timeline', 'bhk', 'purpose', 'source'];
  const filters: Prisma.BuyerWhereInput[] = [];

  for (const field of filterableFields) {
    if (searchParams[field as keyof typeof searchParams]) {
      filters.push({ [field]: { equals: searchParams[field as keyof typeof searchParams] as any } });
    }
  }

  const where: Prisma.BuyerWhereInput = {
    AND: filters,
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ],
    }),
  };
  
  const orderBy: Prisma.BuyerOrderByWithRelationInput = {
      updatedAt: 'desc',
  };

  const [buyers, totalBuyers] = await prisma.$transaction([
    prisma.buyer.findMany({ where, orderBy, take: pageSize, skip: (page - 1) * pageSize }),
    prisma.buyer.count({ where }),
  ]);

  return { buyers, totalBuyers, page, pageSize, where, orderBy };
}

export default async function AllBuyersPage({ searchParams }: Props) {
  const session = await auth();
  const { buyers, totalBuyers, page, pageSize, where, orderBy } = await getPaginatedBuyers(searchParams);
  const hasFilters = Object.values(searchParams).some(val => !!val);
  
  if (totalBuyers === 0 && !hasFilters) {
     redirect('/buyers/new');
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <main className="container mx-auto py-10 px-4">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">All Buyers</h1>
            <p className="text-sm text-slate-500 mt-1">
              A total of <span className="font-semibold text-slate-700">{totalBuyers}</span> lead(s) found.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* --- Go Back Button Added Here --- */}
            <Link href="/" className="inline-flex items-center gap-x-2 whitespace-nowrap bg-white text-slate-700 px-4 py-2 rounded-md shadow-sm border border-slate-300 hover:bg-slate-50 text-sm font-medium">
                <HomeIcon className="h-5 w-5" />
                Go Back
            </Link>
            <ImportExportControls isLoggedIn={!!session?.user} where={where} orderBy={orderBy} />
            <Link href="/buyers/new" className="inline-flex items-center gap-x-2 whitespace-nowrap bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm font-medium">
              <PlusIcon className="h-5 w-5" />
              Add New Buyer
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <Filters />
          <div className="mt-6">
              {buyers.length > 0 ? (
                  <>
                      <BuyerTable buyers={buyers} />
                      <PaginationControls
                          currentPage={page}
                          totalItems={totalBuyers}
                          pageSize={pageSize}
                      />
                  </>
              ) : (
                  <div className="text-center py-16 px-6">
                      <SearchIcon className="mx-auto h-12 w-12 text-slate-400" />
                      <h3 className="mt-2 text-lg font-semibold text-slate-800">No Buyers Found</h3>
                      <p className="mt-1 text-sm text-slate-500">
                          No buyers match the current filters. Try adjusting your search.
                      </p>
                  </div>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- SVG Icon Components ---
function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 10.707V18a1 1 0 01-1 1h-3a1 1 0 01-1-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V10.707a1 1 0 01.293-.707l7-7z" clipRule="evenodd" />
    </svg>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
  );
}
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
    );
}

