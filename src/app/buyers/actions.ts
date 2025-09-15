'use server';

import { auth } from '@/auth';
import { prisma } from "@/lib/prisma";
import { Prisma, Buyer } from "@prisma/client";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Papa from "papaparse";
import { createBuyerSchema } from '@/lib/schemas';

export type ImportResult = {
  errors: { row: number; messages: string[] }[];
  successCount: number;
  totalCount: number;
};

/**
 * Creates a new buyer in the database.
 * Requires an authenticated user.
 */
export async function createBuyerAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a buyer.");
  }

  const data = Object.fromEntries(formData.entries());
  const validation = createBuyerSchema.safeParse(data);

  if (!validation.success) {
    console.error("Validation Error:", validation.error.flatten().fieldErrors);
    return redirect('/buyers/new?error=validation');
  }
  
  try {
    const dataForPrisma = {
      ...validation.data,
      email: validation.data.email || null,
      bhk: validation.data.bhk || null,
      notes: validation.data.notes || null,
      ownerId: session.user.id,
    };

    await prisma.buyer.create({ data: dataForPrisma });
  } catch (error) {
    console.error("Failed to create buyer:", error);
    return redirect('/buyers/new?error=unknown');
  }

  revalidatePath('/buyers');
  redirect('/buyers');
}

/**
 * A simple, self-contained CSV parser to replace Papa.parse for the import.
 * This function has no external dependencies and will not cause type errors.
 */
function manualCsvParser(csvText: string): Record<string, any>[] {
    const lines = csvText.trim().replace(/\r/g, "").split('\n');
    if (lines.length < 2) return [];

    const header = lines[0].split(',').map(h => h.trim());
    const dataRows = lines.slice(1);

    return dataRows.map(line => {
        const values = line.split(',');
        const entry: Record<string, any> = {};
        header.forEach((key, index) => {
            entry[key] = values[index] ? values[index].trim() : '';
        });
        return entry;
    });
}

/**
 * Imports a batch of buyers from a CSV file.
 * This version now uses our own simple parser to avoid library type conflicts.
 */
export async function importBuyersFromCsvAction(csvData: string): Promise<ImportResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: [{ row: 0, messages: ["You must be logged in to import buyers."] }], successCount: 0, totalCount: 0 };
  }
  const ownerId = session.user.id;
  
  try {
    // Using our own parser instead of Papa.parse
    const rows = manualCsvParser(csvData);
    const totalCount = rows.length;

    if (totalCount === 0) {
        return { errors: [{row: 0, messages: ["CSV file is empty or invalid."]}], successCount: 0, totalCount: 0 };
    }

    const validBuyers: Prisma.BuyerCreateManyInput[] = rows.map((row: any) => ({
      ownerId,
      fullName: row.fullName, 
      phone: row.phone,
      email: row.email || null, 
      city: row.city, 
      propertyType: row.propertyType,
      purpose: row.purpose, 
      timeline: row.timeline, 
      source: row.source,
      bhk: row.bhk || null, 
      status: row.status || 'New',
      budgetMin: row.budgetMin ? parseInt(row.budgetMin, 10) : null,
      budgetMax: row.budgetMax ? parseInt(row.budgetMax, 10) : null,
      notes: row.notes || null,
      tags: row.tags ? String(row.tags).split(',').map((t: string) => t.trim()) : [],
    })).filter(b => b.fullName && b.phone);

    if (validBuyers.length === 0) {
      return { errors: [{row: 0, messages: ["No valid rows with fullName and phone found."]}], successCount: 0, totalCount: rows.length };
    }

    const result = await prisma.buyer.createMany({
      data: validBuyers,
      skipDuplicates: true,
    });
    
    if (result.count > 0) {
        revalidatePath('/buyers');
    }
    
    return { errors: [], successCount: result.count, totalCount: rows.length };

  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred. Check if your CSV file format is correct.";
    console.error("Critical import error:", e);
    return { errors: [{ row: 0, messages: [errorMessage] }], successCount: 0, totalCount: 0 };
  }
}

/**
 * Exports a filtered list of buyers to a CSV string.
 * Requires an authenticated user.
 */
export async function exportBuyersToCsvAction(where: Prisma.BuyerWhereInput, orderBy: Prisma.BuyerOrderByWithRelationInput): Promise<string> {
    const session = await auth();
    if (!session?.user) {
        throw new Error("You must be logged in to export buyers.");
    }
    
    const buyers = await prisma.buyer.findMany({ where, orderBy });
    const headers = ["fullName","email","phone","city","propertyType","bhk","purpose","budgetMin","budgetMax","timeline","source","notes","tags","status"];
    
    const csv = Papa.unparse({
        fields: headers,
        data: buyers.map((buyer: Buyer) => headers.map(header => {
            const key = header as keyof Buyer;
            if (key === 'tags') {
                return Array.isArray(buyer[key]) ? (buyer[key] as string[]).join(',') : '';
            }
            return buyer[key];
        }))
    });
    return csv;
}