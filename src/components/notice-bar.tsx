
"use client";

import { Bell, Droplet } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BloodRequest } from '@/lib/types';

interface Notice {
    id: string;
    text: string;
    type: 'notice' | 'request';
}

const NoticeBar = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllNotices = async () => {
        setLoading(true);
        try {
            // Fetch admin notices
            const noticesCollection = collection(db, 'marquee-notices');
            const noticesQuery = query(noticesCollection, orderBy('createdAt', 'desc'));
            const noticesSnapshot = await getDocs(noticesQuery);
            const adminNotices: Notice[] = noticesSnapshot.docs.map(doc => ({
                id: doc.id,
                text: doc.data().text,
                type: 'notice'
            }));

            // Fetch active blood requests
            const requestsCollection = collection(db, 'requests');
            const requestsQuery = query(
                requestsCollection,
                where('status', 'in', ['Pending', 'Approved']),
                orderBy('createdAt', 'desc')
            );
            const requestsSnapshot = await getDocs(requestsQuery);
            const urgentRequests: Notice[] = requestsSnapshot.docs.map(doc => {
                const data = doc.data() as BloodRequest;
                const emergencyText = data.isEmergency ? "জরুরী: " : "";
                const text = `${emergencyText}${data.district}-এ ${data.bloodGroup} রক্তের প্রয়োজন। যোগাযোগ করুন।`;
                return {
                    id: doc.id,
                    text: text,
                    type: 'request'
                };
            });
            
            // Combine and set notices
            setNotices([...adminNotices, ...urgentRequests]);

        } catch (error) {
            console.error("Error fetching notices: ", error);
        } finally {
            setLoading(false);
        }
    };

    fetchAllNotices();
  }, []);

  if (loading || notices.length === 0) {
    return null; // Don't render anything if loading or no notices
  }

  // Duplicate for seamless loop, ensuring we have items
  const allNotices = notices.length > 0 ? [...notices, ...notices] : [];

  return (
    <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {allNotices.map((notice, index) => (
          <div key={`${notice.id}-${index}`} className="flex items-center mx-6">
            {notice.type === 'request' ? (
                <Droplet className="h-4 w-4 mr-2 flex-shrink-0" />
            ) : (
                <Bell className="h-4 w-4 mr-2 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{notice.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticeBar;
