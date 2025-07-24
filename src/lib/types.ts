

export type BloodRequest = {
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
  createdAt?: string;
};

export type Donor = {
  uid: string;
  fullName: string;
  bloodGroup: string;
  phoneNumber: string;
  address: {
    division: string;
    district: string;
    upazila: string;
  };
  lastDonationDate?: string;
  isAvailable: boolean;
  dateOfBirth?: string;
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
  createdAt?: any;
};

    