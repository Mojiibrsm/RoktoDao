export type BloodRequest = {
  id: string;
  patientName: string;
  bloodGroup: string;
  neededDate: string;
  hospitalLocation: string;
  numberOfBags: number;
  contactPhone: string;
  uid?: string;
};

export type Donor = {
  id:string;
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
};
