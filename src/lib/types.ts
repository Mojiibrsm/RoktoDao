
export type BloodRequest = {
  id: string;
  patientName: string;
  bloodGroup: string;
  neededDate: string;
  hospitalLocation: string;
  numberOfBags: number;
  contactPhone: string;
  uid?: string;
  status: 'Pending' | 'Approved' | 'Fulfilled' | 'Rejected';
  isEmergency?: boolean;
  district: string;
  createdAt?: any;
  responders?: string[]; // Array of UIDs of donors who responded
  fulfilledBy?: string; // UID of the donor who fulfilled the request
};

export type Donor = {
  uid: string;
  fullName: string;
  email?: string | null;
  bloodGroup: string;
  phoneNumber: string;
  address: {
    division: string;
    district: string;
    upazila: string;
  };
  lastDonationDate?: string | null;
  isAvailable: boolean;
  dateOfBirth?: string | null;
  gender?: 'Male' | 'Female' | 'Other';
  donationCount?: number;
  isAdmin?: boolean;
  profilePictureUrl?: string;
  notificationSettings?: {
    getBloodRequests: boolean;
    getEmailNotifications: boolean;
    getSmsAlerts: boolean;
  };
  privacySettings?: {
    contactVisibility: 'everyone' | 'verified' | 'hidden';
    profileVisibility: 'public' | 'admin' | 'hidden';
  };
  isVerified?: boolean;
  isPinned?: boolean;
  createdAt?: any;
};

export interface BlogPost {
  id: string;
  link: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  image: string;
  hint: string;
  createdAt: any;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  status: 'pending' | 'approved';
  uploaderId?: string;
  createdAt: any;
}

export type FeedbackType = {
  id: string;
  user: {
    name: string;
    email: string;
  };
  type: 'Bug' | 'Suggestion' | 'Complaint' | 'Other';
  message: string;
  date: string;
  status: 'New' | 'In Progress' | 'Resolved' | 'Ignored';
  createdAt?: any;
};

export type SmsLog = {
  id: string;
  number: string;
  message: string;
  status: 'success' | 'failure';
  apiUsed: 'BulkSMSBD' | 'Both Failed';
  createdAt: any;
};
