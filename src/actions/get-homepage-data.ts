
'use server';

import { supabase } from '@/lib/supabase';
import type { BloodRequest, Donor, BlogPost } from '@/lib/types';
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

// Helper to convert date strings to a standard format for calculation
// and a display format for presentation.
const processDateFields = (docData: any) => {
    const data = { ...docData };
    const dateFields = ['lastDonationDate', 'neededDate', 'dateOfBirth', 'createdAt', 'date'];
    for (const key in data) {
        if (dateFields.includes(key) && data[key]) {
            try {
                // Keep the raw date for calculations if needed elsewhere
                data[`${key}_raw`] = data[key]; 
                // Format a display-friendly version
                data[key] = format(new Date(data[key]), 'PPP');
            } catch (e) {
                console.warn(`Could not format date for key: ${key}, value: ${data[key]}`);
            }
        }
    }
    return data;
};


export async function getHomepageData() {
    try {
        // Fetch all data in parallel from Supabase
        const [
            requestsRes,
            donorsRes,
            totalDonorsRes,
            requestCountRes,
            fulfilledCountRes,
            activeDonorsRes,
            directorRes,
            galleryRes,
            blogRes
        ] = await Promise.all([
            supabase.from('requests').select('*').eq('status', 'Approved').order('neededDate', { ascending: true }).limit(6),
            supabase.from('donors').select('*').eq('isAvailable', true).order('isPinned', { ascending: false }).order('createdAt', { ascending: false }).limit(6),
            supabase.from('donors').select('*', { count: 'exact', head: true }),
            supabase.from('requests').select('*', { count: 'exact', head: true }),
            supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'Fulfilled'),
            supabase.from('donors').select('*', { count: 'exact', head: true }).eq('isAvailable', true),
            supabase.from('moderators').select('*').eq('role', 'প্রধান পরিচালক').limit(1),
            supabase.from('gallery').select('*').eq('status', 'approved').order('createdAt', { ascending: false }).limit(8),
            supabase.from('blogs').select('*').order('createdAt', { ascending: false }).limit(3)
        ]);
        
        // Process Urgent Requests
        const urgentRequests = requestsRes.data?.map(processDateFields) as BloodRequest[] || [];

        // Process Donors
        const donors = donorsRes.data?.map(processDateFields) as Donor[] || [];

        // Process Stats
        const stats: Stats = {
            totalDonors: totalDonorsRes.count ?? 0,
            totalRequests: requestCountRes.count ?? 0,
            donationsFulfilled: fulfilledCountRes.count ?? 0,
            activeDonors: activeDonorsRes.count ?? 0,
        };

        // Process Director
        let director: Member | null = null;
        if (directorRes.data && directorRes.data.length > 0) {
            director = processDateFields(directorRes.data[0]) as Member;
        }

        // Process Gallery Images
        const galleryImages = galleryRes.data as GalleryImage[] || [];

        // Process Blog Posts
        const blogPosts = blogRes.data?.map(processDateFields) as BlogPost[] || [];
        
        return {
            donors,
            urgentRequests,
            stats,
            director,
            galleryImages,
            blogPosts,
        };
        
      } catch (error: any) {
        console.error("Error fetching homepage data from Supabase:", error.message);
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
