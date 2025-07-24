export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const locations = {
  "Dhaka": {
    districts: ["Dhaka", "Gazipur", "Narayanganj", "Tangail", "Faridpur"]
  },
  "Chittagong": {
    districts: ["Chittagong", "Comilla", "Cox's Bazar", "Noakhali", "Feni"]
  },
  "Rajshahi": {
    districts: ["Rajshahi", "Bogra", "Pabna", "Sirajganj", "Naogaon"]
  },
  "Khulna": {
    districts: ["Khulna", "Jessore", "Kushtia", "Satkhira", "Bagerhat"]
  },
  "Barisal": {
    districts: ["Barisal", "Patuakhali", "Bhola", "Pirojpur", "Jhalokati"]
  },
  "Sylhet": {
    districts: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"]
  },
  "Rangpur": {
    districts: ["Rangpur", "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat"]
  },
  "Mymensingh": {
    districts: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"]
  }
};

export const upazilas = {
  "Dhaka": ["Demra", "Dhanmondi", "Gulshan", "Mirpur", "Mohammadpur", "Motijheel", "Pallabi", "Ramna", "Savar", "Uttara"],
  "Gazipur": ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"],
  "Narayanganj": ["Narayanganj Sadar", "Araihazar", "Bandar", "Rupganj", "Sonargaon"],
  "Tangail": ["Tangail Sadar", "Basail", "Bhuapur", "Delduar", "Ghatail", "Gopalpur", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur"],
  "Faridpur": ["Faridpur Sadar", "Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan", "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha"],
  "Chittagong": ["Anwara", "Banshkhali", "Boalkhali", "Chandanaish", "Fatikchhari", "Hathazari", "Karnaphuli", "Lohagara", "Mirsharai", "Patiya", "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda"],
  "Comilla": ["Comilla Sadar", "Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram", "Daudkandi", "Debidwar", "Homna", "Laksam", "Monohorgonj", "Meghna", "Muradnagar", "Nangalkot", "Titas"],
  "Cox's Bazar": ["Cox's Bazar Sadar", "Chakaria", "Kutubdia", "Maheshkhali", "Ramu", "Teknaf", "Ukhia", "Pekua"],
  "Noakhali": ["Noakhali Sadar", "Begumganj", "Chatkhil", "Compnaiganj", "Hatiya", "Kabirhat", "Senbagh", "Sonaimuri", "Subarnachar"],
  "Feni": ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Fulgazi", "Parshuram", "Sonagazi"],
  "Rajshahi": ["Bagha", "Bagmara", "Charghat", "Durgapur", "Godagari", "Mohanpur", "Paba", "Puthia", "Tanore"],
  "Bogra": ["Bogra Sadar", "Adamdighi", "Dhunat", "Dupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur", "Shibganj", "Sonatala"],
  "Pabna": ["Pabna Sadar", "Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Santhia", "Sujanagar"],
  "Sirajganj": ["Sirajganj Sadar", "Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Raiganj", "Shahjadpur", "Tarash", "Ullahpara"],
  "Naogaon": ["Naogaon Sadar", "Atrai", "Badalgachhi", "Dhamoirhat", "Manda", "Mohadevpur", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"],
  "Khulna": ["Batiaghata", "Dacope", "Dighalia", "Dumuria", "Koyra", "Paikgachha", "Phultala", "Rupsha", "Terokhada"],
  "Jessore": ["Jessore Sadar", "Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha"],
  "Kushtia": ["Kushtia Sadar", "Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Mirpur"],
  "Satkhira": ["Satkhira Sadar", "Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Shyamnagar", "Tala"],
  "Bagerhat": ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"],
  "Barisal": ["Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Gaurnadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur"],
  "Patuakhali": ["Patuakhali Sadar", "Bauphal", "Dashmina", "Galachipa", "Kalapara", "Mirzaganj", "Rangabali", "Dumki"],
  "Bhola": ["Bhola Sadar", "Burhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"],
  "Pirojpur": ["Pirojpur Sadar", "Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Nesarabad (Swarupkathi)", "Zianagar"],
  "Jhalokati": ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"],
  "Sylhet": ["Sylhet Sadar", "Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Zakiganj"],
  "Moulvibazar": ["Moulvibazar Sadar", "Barlekha", "Juri", "Kamalganj", "Kulaura", "Rajnagar", "Sreemangal"],
  "Habiganj": ["Habiganj Sadar", "Ajmiriganj", "Bahubal", "Baniyachong", "Chunarughat", "Lakhai", "Madhabpur", "Nabiganj"],
  "Sunamganj": ["Sunamganj Sadar", "Bishwamvarpur", "Chhatak", "Derai", "Dharampasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Sullah", "Tahirpur"],
  "Rangpur": ["Rangpur Sadar", "Badarganj", "Gangachhara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Taraganj"],
  "Dinajpur": ["Dinajpur Sadar", "Biral", "Birampur", "Birganj", "Bochaganj", "Chirirbandar", "Phulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur"],
  "Gaibandha": ["Gaibandha Sadar", "Fulchhari", "Gobindaganj", "Palashbari", "Sadullapur", "Sughatta", "Sundarganj"],
  "Kurigram": ["Kurigram Sadar", "Bhurungamari", "Char Rajibpur", "Chilmari", "Nageshwari", "Phulbari", "Rajarhat", "Raomari", "Ulipur"],
  "Lalmonirhat": ["Lalmonirhat Sadar", "Aditmari", "Hatibandha", "Kaliganj", "Patgram"],
  "Mymensingh": ["Mymensingh Sadar", "Bhaluka", "Dhobaura", "Fulbaria", "Gaffargaon", "Gauripur", "Haluaghat", "Ishwarganj", "Muktagachha", "Nandail", "Phulpur", "Trishal"],
  "Jamalpur": ["Jamalpur Sadar", "Baksiganj", "Dewanganj", "Islampur", "Madarganj", "Melandaha", "Sarishabari"],
  "Netrokona": ["Netrokona Sadar", "Atpara", "Barhatta", "Durgapur", "Kalmakanda", "Kendua", "Khaliajuri", "Madan", "Mohanganj", "Purbadhala"],
  "Sherpur": ["Sherpur Sadar", "Jhenaigati", "Nakla", "Nalitabari", "Sreebardi"],
};

export const hospitalList = [
  { value: "Dhaka Medical College Hospital, Dhaka", label: "Dhaka Medical College Hospital, Dhaka" },
  { value: "Bangabandhu Sheikh Mujib Medical University (BSMMU), Dhaka", label: "Bangabandhu Sheikh Mujib Medical University (BSMMU), Dhaka" },
  { value: "Sir Salimullah Medical College Hospital (Mitford), Dhaka", label: "Sir Salimullah Medical College Hospital (Mitford), Dhaka" },
  { value: "Shaheed Suhrawardy Medical College Hospital, Dhaka", label: "Shaheed Suhrawardy Medical College Hospital, Dhaka" },
  { value: "National Institute of Cardiovascular Diseases (NICVD), Dhaka", label: "National Institute of Cardiovascular Diseases (NICVD), Dhaka" },
  { value: "National Institute of Traumatology and Orthopaedic Rehabilitation (NITOR), Dhaka", label: "National Institute of Traumatology and Orthopaedic Rehabilitation (NITOR), Dhaka" },
  { value: "Square Hospitals Ltd., Dhaka", label: "Square Hospitals Ltd., Dhaka" },
  { value: "Apollo Hospitals Dhaka (Evercare)", label: "Apollo Hospitals Dhaka (Evercare)" },
  { value: "United Hospital Limited, Dhaka", label: "United Hospital Limited, Dhaka" },
  { value: "Labaid Specialized Hospital, Dhaka", label: "Labaid Specialized Hospital, Dhaka" },
  { value: "Chittagong Medical College Hospital, Chittagong", label: "Chittagong Medical College Hospital, Chittagong" },
  { value: "BIRDEM General Hospital, Dhaka", label: "BIRDEM General Hospital, Dhaka" },
  { value: "Combined Military Hospital (CMH), Dhaka", label: "Combined Military Hospital (CMH), Dhaka" },
  { value: "Ibn Sina Specialized Hospital, Dhaka", label: "Ibn Sina Specialized Hospital, Dhaka" },
  { value: "Rajshahi Medical College Hospital, Rajshahi", label: "Rajshahi Medical College Hospital, Rajshahi" },
  { value: "Mymensingh Medical College Hospital, Mymensingh", label: "Mymensingh Medical College Hospital, Mymensingh" },
  { value: "Sylhet M.A.G. Osmani Medical College Hospital, Sylhet", label: "Sylhet M.A.G. Osmani Medical College Hospital, Sylhet" },
  { value: "Khulna Medical College Hospital, Khulna", label: "Khulna Medical College Hospital, Khulna" },
  { value: "Sher-e-Bangla Medical College Hospital, Barisal", label: "Sher-e-Bangla Medical College Hospital, Barisal" },
  { value: "Rangpur Medical College Hospital, Rangpur", label: "Rangpur Medical College Hospital, Rangpur" },
  { value: "Cox's Bazar Sadar Hospital, Cox's Bazar", label: "Cox's Bazar Sadar Hospital, Cox's Bazar" },
  { value: "Comilla Medical College Hospital, Comilla", label: "Comilla Medical College Hospital, Comilla" },
];
