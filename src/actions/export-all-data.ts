
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Helper to convert Firestore Timestamps to serializable ISO strings
// and handle nested objects for JSON conversion.
const convertDataForExport = (docData: Record<string, any>): Record<string, any> => {
    const data: Record<string, any> = {};
    for (const key in docData) {
        if (Object.prototype.hasOwnProperty.call(docData, key)) {
            const value = docData[key];
            if (value instanceof Timestamp) {
                data[key] = value.toDate().toISOString();
            } else if (value instanceof Date) {
                data[key] = value.toISOString();
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // Convert nested objects to JSON strings for fields like 'address' or 'user'
                data[key] = JSON.stringify(value);
            } else {
                data[key] = value;
            }
        }
    }
    return data;
};

// Generic export function
async function exportCollection(collectionName: string): Promise<Record<string, any>[]> {
    try {
        const collectionRef = adminDb.collection(collectionName);
        const snapshot = await collectionRef.get();

        if (snapshot.empty) {
            console.log(`No documents found in ${collectionName} to export.`);
            return [];
        }

        const data = snapshot.docs.map(doc => {
            const docData = doc.data();
            const serializableData = convertDataForExport(docData);
            
            return {
                id: doc.id,
                ...serializableData,
            };
        });
        
        return data;

    } catch (error) {
        console.error(`Error exporting ${collectionName} data:`, error);
        throw new Error(`Failed to export ${collectionName} data.`);
    }
}


export async function exportBlogsAction(): Promise<Record<string, any>[]> {
    return exportCollection('blogs');
}

export async function exportDonorsAction(): Promise<Record<string, any>[]> {
    return exportCollection('donors');
}

export async function exportGalleryAction(): Promise<Record<string, any>[]> {
    return exportCollection('gallery');
}

export async function exportMarqueeNoticesAction(): Promise<Record<string, any>[]> {
    return exportCollection('marquee-notices');
}

export async function exportModeratorsAction(): Promise<Record<string, any>[]> {
    return exportCollection('moderators');
}

export async function exportRequestsAction(): Promise<Record<string, any>[]> {
    return exportCollection('requests');
}

export async function exportSettingsAction(): Promise<Record<string, any>[]> {
    return exportCollection('settings');
}

export async function exportSmsLogsAction(): Promise<Record<string, any>[]> {
    return exportCollection('sms_logs');
}
