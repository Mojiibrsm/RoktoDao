
"use client";

import { Bell, Droplet } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import type { BloodRequest } from '@/lib/types';
import { supabase } from '@/lib/supabase';

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
            // Fetch admin notices from Supabase
            const { data: adminNoticesData, error: noticesError } = await supabase
                .from('marquee_notices')
                .select('id, text')
                .order('createdAt', { ascending: false });

            if (noticesError) throw noticesError;

            const adminNotices: Notice[] = adminNoticesData.map(notice => ({
                id: notice.id,
                text: notice.text,
                type: 'notice'
            }));

            // Fetch active blood requests from Supabase
            const { data: requestsData, error: requestsError } = await supabase
                .from('requests')
                .select('id, bloodGroup, district, isEmergency, status')
                .in('status', ['Pending', 'Approved'])
                .order('createdAt', { ascending: false });

            if (requestsError) throw requestsError;
            
            const urgentRequests: Notice[] = requestsData.map(data => {
                const emergencyText = data.isEmergency ? "জরুরী: " : "";
                const text = `${emergencyText}${data.district}-এ ${data.bloodGroup} রক্তের প্রয়োজন। যোগাযোগ করুন।`;
                return {
                    id: data.id,
                    text: text,
                    type: 'request'
                };
            });
            
            // Combine and set notices
            setNotices([...adminNotices, ...urgentRequests]);

        } catch (error) {
            console.error("Error fetching notices from Supabase: ", error);
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
