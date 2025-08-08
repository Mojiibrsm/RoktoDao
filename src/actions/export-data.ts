
'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { Donor } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

// Helper to convert Firestore Timestamps to serializable ISO strings
const convertTimestampsToStrings = (docData: any) => {
    const data = { ...docData };
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate().toISOString();
        } else if (data[key] instanceof Date) {
            data[key] = data[key].toISOString();
        }
    }
    return data;
};


export async function exportDonorsToCsvAction(): Promise<Partial<Donor>[]> {
    try {
        const donorsRef = adminDb.collection('donors');
        const donorsSnapshot = await donorsRef.get();

        if (donorsSnapshot.empty) {
            console.log("No donors found to export.");
            return [];
        }

        const donorsData = donorsSnapshot.docs.map(doc => {
            const data = doc.data();
            const serializableData = convertTimestampsToStrings(data);

            // Create a donor object for CSV, ensuring address is a JSON string
            const donor = {
                ...serializableData,
                address: data.address ? JSON.stringify(data.address) : null,
            };

            // IMPORTANT: We are intentionally removing the `uid` from the export
            // because Firestore doc IDs are not valid UUIDs for Supabase.
            // The `uid` will need to be populated later, possibly by matching emails or phone numbers
            // after the initial data import.
            delete (donor as any).uid;

            return donor as Partial<Donor>;
        });
        
        return donorsData;

    } catch (error) {
        console.error("Error exporting donor data:", error);
        throw new Error("Failed to export donor data.");
    }
}
