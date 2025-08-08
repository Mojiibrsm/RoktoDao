
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Helper to convert Firestore Timestamps to serializable ISO strings
const convertTimestampsToStrings = (docData: any): Record<string, any> => {
    const data: Record<string, any> = { ...docData };
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate().toISOString();
        } else if (data[key] instanceof Date) {
            data[key] = data[key].toISOString();
        } else if (typeof data[key] === 'object' && data[key] !== null) {
            data[key] = JSON.stringify(data[key]);
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
            const serializableData = convertTimestampsToStrings(docData);
            
            // For the donors collection, we remove the uid to avoid Supabase import issues.
            if (collectionName === 'donors') {
              delete serializableData.uid;
            }

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
