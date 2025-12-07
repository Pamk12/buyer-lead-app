import { City, PropertyType, Bhk, Purpose, Timeline, Source, Status, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { checkRateLimit } from '@/lib/rate-limit'; // Import the rate limit utility

// This is a Server Component that can handle feedback via URL search params.
export default async function NewBuyerPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const session = await auth();

  // If the user is not logged in, redirect them to the sign-in page.
  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  async function createBuyer(formData: FormData) {
    'use server';
    
    // Re-verify session inside the action for security.
    const currentSession = await auth();
    if (!currentSession?.user?.id) {
        // This should not happen if the page guard works, but it's good practice.
        return redirect('/api/auth/signin?error=SessionExpired');
    }
    const userId = currentSession.user.id;

    const data = Object.fromEntries(formData.entries());
    const bhkValue = data.bhk as string;

    try {
        // --- RATE LIMITING ---
        // Apply the rate limit at the beginning of the action.
        checkRateLimit(userId);

        await prisma.buyer.create({
            data: {
                fullName: data.fullName as string,
                email: data.email as string || null,
                phone: data.phone as string,
                city: data.city as City,
                propertyType: data.propertyType as PropertyType,
                bhk: bhkValue === '' ? null : bhkValue as Bhk,
                purpose: data.purpose as Purpose,
                budgetMin: data.budgetMin ? parseInt(data.budgetMin as string) : null,
                budgetMax: data.budgetMax ? parseInt(data.budgetMax as string) : null,
                timeline: data.timeline as Timeline,
                source: data.source as Source,
                status: (data.status as Status) || Status.New,
                notes: data.notes as string || null,
                ownerId: userId,
            },
        });
    } catch (error) {
        // --- ERROR HANDLING ---
        // Catch the specific "Unique Constraint Failed" error from Prisma.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
             const errorMessage = "A buyer with this phone number already exists for your account.";
             return redirect(`/buyers/new?error=${encodeURIComponent(errorMessage)}`);
        }
        
        // Catch other errors, including the rate limit error.
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
        return redirect(`/buyers/new?error=${encodeURIComponent(errorMessage)}`);
    }

    revalidatePath('/buyers');
    // Redirect to the buyers list with a success indicator.
    redirect('/buyers?created=true');
  }

  const enums = {
    cities: Object.values(City),
    propertyTypes: Object.values(PropertyType),
    bhks: Object.values(Bhk),
    purposes: Object.values(Purpose),
    timelines: Object.values(Timeline),
    sources: Object.values(Source),
    statuses: Object.values(Status),
  };
  
  const FormField = ({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) => (
    <div>
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1">{children}</div>
    </div>
  );

  return (
    <main className="bg-slate-50 min-h-screen py-8 px-4">
        {/* Adjusted padding: p-6 for mobile, sm:p-8 for tablet/desktop */}
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            
            {/* --- Header Made Responsive --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Add New Buyer</h1>
                    <p className="text-lg text-gray-600 mt-1">Enter the details for the new lead.</p>
                </div>
                 <Link href="/buyers" className="w-full sm:w-auto inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap">
                    Go Back to Buyers
                </Link>
            </div>
            
            <form action={createBuyer} className="space-y-8 mt-8">
                {/* --- ACCESSIBLE ERROR MESSAGE --- */}
                {/* This block will now display rate limit errors and other validation messages. */}
                {searchParams?.error && (
                    <div role="alert" className="p-4 bg-red-100 text-red-800 rounded-md text-center font-medium">
                        <p>{searchParams.error}</p>
                    </div>
                )}
                
                <section>
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-6">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Full Name" htmlFor="fullName"><input type="text" name="fullName" id="fullName" required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" /></FormField>
                        <FormField label="Email" htmlFor="email"><input type="email" name="email" id="email" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" /></FormField>
                        <FormField label="Phone" htmlFor="phone"><input type="tel" name="phone" id="phone" required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" /></FormField>
                    </div>
                </section>
                <section>
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-6">Property Requirements</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="City" htmlFor="city"><select name="city" id="city" required className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-900">{enums.cities.map(city => <option key={city} value={city}>{city}</option>)}</select></FormField>
                        <FormField label="Property Type" htmlFor="propertyType"><select name="propertyType" id="propertyType" required className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-900">{enums.propertyTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}</select></FormField>
                        <FormField label="BHK" htmlFor="bhk"><select name="bhk" id="bhk" className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-900"><option value="">N/A</option>{enums.bhks.map(bhk => <option key={bhk} value={bhk}>{bhk}</option>)}</select></FormField>
                        <FormField label="Purpose" htmlFor="purpose"><select name="purpose" id="purpose" required className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-900">{enums.purposes.map(p => <option key={p} value={p}>{p}</option>)}</select></FormField>
                        <FormField label="Min Budget" htmlFor="budgetMin"><input type="number" name="budgetMin" id="budgetMin" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" /></FormField>
                        <FormField label="Max Budget" htmlFor="budgetMax"><input type="number" name="budgetMax" id="budgetMax" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" /></FormField>
                    </div>
                </section>
                <section>
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-6">Lead Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Timeline" htmlFor="timeline"><select name="timeline" id="timeline" required className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-900">{enums.timelines.map(t => <option key={t} value={t}>{t}</option>)}</select></FormField>
                        <FormField label="Source" htmlFor="source"><select name="source" id="source" required className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-900">{enums.sources.map(s => <option key={s} value={s}>{s}</option>)}</select></FormField>
                        <FormField label="Status" htmlFor="status"><select name="status" id="status" defaultValue={Status.New} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-900">{enums.statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></FormField>
                    </div>
                      <div className="grid grid-cols-1 gap-6 mt-6">
                        <FormField label="Notes" htmlFor="notes"><textarea name="notes" id="notes" rows={5} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"></textarea></FormField>
                    </div>
                </section>
                <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end">
                    <button type="submit" className="w-full md:w-auto px-6 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Create Buyer</button>
                </div>
            </form>
        </div>
    </main>
  );
}