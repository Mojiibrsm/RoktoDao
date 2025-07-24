
"use client";

import { Bell, Droplet } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Notice {
    id: string;
    text: string;
}

const NoticeBar = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
        try {
            const noticesCollection = collection(db, 'marquee-notices');
            const q = query(noticesCollection, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const noticesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice));
            setNotices(noticesList);
        } catch (error) {
            console.error("Error fetching notices: ", error);
        } finally {
            setLoading(false);
        }
    };

    fetchNotices();
  }, []);

  if (loading || notices.length === 0) {
    return null; // Don't render anything if loading or no notices
  }

  const allNotices = [...notices, ...notices]; // Duplicate for seamless loop

  return (
    <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {allNotices.map((notice, index) => (
          <div key={`${notice.id}-${index}`} className="flex items-center mx-6">
            {index % 2 === 0 ? <Droplet className="h-4 w-4 mr-2 flex-shrink-0" /> : <Bell className="h-4 w-4 mr-2 flex-shrink-0" />}
            <span className="text-sm font-medium">{notice.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticeBar;
