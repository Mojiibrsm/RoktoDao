

'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { BloodRequest, Donor, BlogPost } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';
import { format } from 'date-fns';

interface GalleryImage {
    id: string;
    imageUrl: string;
    status: 'approved' | 'pending';
}
interface Stats {
  totalDonors: number;
  totalRequests: number;
  donationsFulfilled: number;
  activeDonors: number;
}
interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
  avatarHint?: string;
}

// Helper to convert Firestore Timestamps to serializable and formatted strings
const convertTimestamps = (docData: any) => {
    const data = { ...docData };
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            if (key === 'lastDonationDate' || key === 'neededDate' || key === 'dateOfBirth') {
                data[key] = format(data[key].toDate(), 'PPP');
            } else {
                data[key] = data[key].toDate().toISOString();
            }
        }
    }
    return data;
};


export async function getHomepageData() {
    try {
        const requestsRef = adminDb.collection('requests');
        const donorsRef = adminDb.collection('donors');
        const modsCollection = adminDb.collection('moderators');
        const imagesRef = adminDb.collection('gallery');
        const blogsRef = adminDb.collection('blogs');
        const settingsRef = adminDb.collection('settings').doc('global');

        // Define all queries
        const reqQuery = requestsRef.where('status', '==', 'Approved').orderBy('neededDate', 'asc').limit(6);
        const pinnedDonorsQuery = donorsRef.where('isPinned', '==', true).where('isAvailable', '==', true).limit(6);
        const latestDonorsQuery = donorsRef.where('isAvailable', '==', true).where('isPinned', '!=', true).orderBy('isPinned').orderBy('createdAt', 'desc').limit(6);
        const directorQuery = modsCollection.where('role', '==', 'প্রধান পরিচালক').limit(1);
        const galleryQuery = imagesRef.where('status', '==', 'approved').orderBy('createdAt', 'desc').limit(8);
        const blogQuery = blogsRef.orderBy('createdAt', 'desc').limit(3);

        // Fetch all data in parallel
        const [
            reqSnapshot,
            pinnedSnapshot,
            latestDonorsSnapshot,
            requestCountSnap,
            fulfilledCountSnap,
            activeDonorsSnap,
            directorSnapshot,
            gallerySnapshot,
            blogSnapshot,
            settingsSnapshot,
        ] = await Promise.all([
            reqQuery.get(),
            pinnedDonorsQuery.get(),
            latestDonorsQuery.get(),
            requestsRef.count().get(),
            requestsRef.where("status", "==", "Fulfilled").count().get(),
            donorsRef.where("isAvailable", "==", true).count().get(),
            directorQuery.get(),
            galleryQuery.get(),
            blogQuery.get(),
            settingsRef.get(),
        ]);

        // Process Urgent Requests
        const urgentRequests = reqSnapshot.docs.map(doc => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as BloodRequest[];

        // Process Donors: Show pinned donors first, otherwise show latest donors.
        let donors: Donor[];
        if (!pinnedSnapshot.empty) {
            donors = pinnedSnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as Donor));
        } else {
            donors = latestDonorsSnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as Donor));
        }

        // Process Stats
        const totalDonors = settingsSnapshot.exists ? settingsSnapshot.data()?.publicTotalDonors || 0 : 0;
        const stats: Stats = {
            totalDonors: totalDonors,
            totalRequests: requestCountSnap.data().count,
            donationsFulfilled: fulfilledCountSnap.data().count,
            activeDonors: activeDonorsSnap.data().count,
        };

        // Process Director
        let director: Member | null = null;
        if (!directorSnapshot.empty) {
            const directorDoc = directorSnapshot.docs[0];
            director = { id: directorDoc.id, ...convertTimestamps(directorDoc.data()) } as Member;
        }

        // Process Gallery Images
        const galleryImages = gallerySnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) })) as GalleryImage[];

        // Process Blog Posts
        const blogPosts = blogSnapshot.docs.map(doc => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as BlogPost[];
        
        return {
            donors,
            urgentRequests,
            stats,
            director,
            galleryImages,
            blogPosts,
        };
        
      } catch (error: any) {
        console.error("Error fetching homepage data:", error.message);
        // Return a default empty state in case of an error
        return {
            donors: [],
            urgentRequests: [],
            stats: { totalDonors: 0, totalRequests: 0, donationsFulfilled: 0, activeDonors: 0 },
            director: null,
            galleryImages: [],
            blogPosts: [],
        };
      }
}

