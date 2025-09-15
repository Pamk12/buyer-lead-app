import { z } from 'zod';
import { Status, City, PropertyType, Bhk, Purpose, Timeline, Source } from '@prisma/client';

// A base schema with all the common fields for a buyer
const baseBuyerSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  city: z.nativeEnum(City),
  propertyType: z.nativeEnum(PropertyType),
  purpose: z.nativeEnum(Purpose),
  timeline: z.nativeEnum(Timeline),
  source: z.nativeEnum(Source),
  status: z.nativeEnum(Status),
  bhk: z.nativeEnum(Bhk).optional().or(z.literal('')).nullable(),
  budgetMin: z.coerce.number().int().positive().optional().nullable(),
  budgetMax: z.coerce.number().int().positive().optional().nullable(),
  notes: z.string().optional(),
  tags: z.string().optional().transform(val => 
    val ? val.split(',').map(tag => tag.trim()).filter(Boolean) : []
  ),
});

/**
 * Schema for CREATING a new buyer.
 * It uses the base schema directly.
 */
export const createBuyerSchema = baseBuyerSchema;

/**
 * Schema for UPDATING an existing buyer.
 * It extends the base schema to add the required `updatedAt` field
 * for the concurrency check.
 */
export const updateBuyerSchema = baseBuyerSchema.extend({
  updatedAt: z.string().datetime({ message: "Invalid updatedAt timestamp." }),
});

// We can also infer the TypeScript types from our schemas if needed elsewhere
export type CreateBuyerData = z.infer<typeof createBuyerSchema>;
export type UpdateBuyerData = z.infer<typeof updateBuyerSchema>;