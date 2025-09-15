import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from 'next/link';
import { auth } from '@/auth'; // Import the auth helper from your config

// This function now uses NextAuth.js to get the real user's session
async function getCurrentUserEmail(): Promise<string | null> {
  const session = await auth(); // Fetches the current session
  return session?.user?.email ?? null; // Returns the user's email or null if not logged in
}

// Helper function to format the budget
const formatBudget = (min: number | null, max: number | null) => {
    const format = (num: number | null) => {
        if (num === null || num === undefined) return 'N/A';
        // This is a simple formatter assuming the numbers are in a consistent unit (e.g., Lacs)
        return `${num.toLocaleString()}`;
    };
    return `${format(min)} - ${format(max)}`;
};

// Helper component for displaying a detail with an icon
const DetailItem = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
    <div>
        <dt className="flex items-center text-sm font-medium text-gray-500">
            {icon}
            <span className="ml-2">{label}</span>
        </dt>
        <dd className="mt-1 text-md text-gray-900 ml-8">{children}</dd>
    </div>
);


type Props = {
  params: {
    id: string;
  };
};

export default async function SingleBuyerPage({ params }: Props) {
  const currentUserEmail = await getCurrentUserEmail();

  const buyer = await prisma.buyer.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!buyer) {
    notFound();
  }
  
  const canEdit = currentUserEmail && buyer.email && currentUserEmail.toLowerCase() === buyer.email.toLowerCase();

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-4xl font-bold text-gray-900">{buyer.fullName}</h1>
                <div className="flex items-center text-md text-gray-600 mt-2 space-x-4">
                    <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {buyer.email || 'No email'}
                    </span>
                    <span className="flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {buyer.phone}
                    </span>
                </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
                 <Link href="/buyers" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                    Go Back
                </Link>
                {canEdit && (
                    <Link href={`/buyers/${buyer.id}/edit`} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">
                        Edit Buyer
                    </Link>
                )}
            </div>
        </div>
        
        <div className="mt-8 space-y-8">
            {/* Property Details */}
            <section>
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">Property Details</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    <DetailItem label="City" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>{buyer.city}</DetailItem>
                    <DetailItem label="Property Type" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}>{buyer.propertyType}</DetailItem>
                    <DetailItem label="BHK" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>}>{buyer.bhk || 'N/A'}</DetailItem>
                    <DetailItem label="Purpose" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 7z" /></svg>}>{buyer.purpose}</DetailItem>
                </dl>
            </section>

             {/* Lead Information */}
             <section>
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">Lead Information</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    <DetailItem label="Budget" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}>{formatBudget(buyer.budgetMin, buyer.budgetMax)}</DetailItem>
                    <DetailItem label="Timeline" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>{buyer.timeline}</DetailItem>
                    <DetailItem label="Source" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}>{buyer.source}</DetailItem>
                    <DetailItem label="Status" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{buyer.status}</span></DetailItem>
                </dl>
             </section>
             
              {/* Notes & Tags */}
              <section>
                 <dl className="grid grid-cols-1 gap-y-6">
                    <DetailItem label="Tags" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 8V3a1 1 0 011-1zm0 5a1 1 0 100-2 1 1 0 000 2z" /></svg>}>
                        {buyer.tags.length > 0 ? buyer.tags.map((tag: string) => (
                            <span key={tag} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{tag}</span>
                        )) : 'No tags'}
                    </DetailItem>
                    <DetailItem label="Notes" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>
                        <p className="whitespace-pre-wrap">{buyer.notes || 'No notes provided.'}</p>
                    </DetailItem>
                 </dl>
              </section>
        </div>
      </div>
    </main>
  );
}

