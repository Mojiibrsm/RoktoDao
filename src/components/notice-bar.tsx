import { Bell, Droplet } from 'lucide-react';
import React from 'react';

const notices = [
    "রক্তদান ক্যাম্প ২৫ জুলাই - মিরপুর, ঢাকা",
    "চট্টগ্রাম মেডিকেলে B+ রক্ত খুব জরুরি - যোগাযোগ: 01XXXXXXXXX",
    "জরুরী O- রক্তের প্রয়োজন, ইউনাইটেড হাসপাতাল - যোগাযোগ: 01XXXXXXXXX",
    "থ্যালাসেমিয়া রোগীদের জন্য বিশেষ রক্তদান কর্মসূচী আগামী মাসে।"
];

const NoticeBar = () => {
  return (
    <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {notices.map((notice, index) => (
          <div key={index} className="flex items-center mx-6">
            {index % 2 === 0 ? <Droplet className="h-4 w-4 mr-2 flex-shrink-0" /> : <Bell className="h-4 w-4 mr-2 flex-shrink-0" />}
            <span className="text-sm font-medium">{notice}</span>
          </div>
        ))}
         {/* Duplicate for seamless loop */}
        {notices.map((notice, index) => (
          <div key={`duplicate-${index}`} aria-hidden="true" className="flex items-center mx-6">
            {index % 2 === 0 ? <Droplet className="h-4 w-4 mr-2 flex-shrink-0" /> : <Bell className="h-4 w-4 mr-2 flex-shrink-0" />}
            <span className="text-sm font-medium">{notice}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticeBar;
