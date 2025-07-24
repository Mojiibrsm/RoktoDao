
export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const locations = {
  "ঢাকা": {
    districts: ["ঢাকা", "গাজীপুর", "নারায়ণগঞ্জ", "টাঙ্গাইল", "ফরিদপুর"]
  },
  "চট্টগ্রাম": {
    districts: ["চট্টগ্রাম", "কুমিল্লা", "কক্সবাজার", "নোয়াখালী", "ফেনী"]
  },
  "রাজশাহী": {
    districts: ["রাজশাহী", "বগুড়া", "পাবনা", "সিরাজগঞ্জ", "নওগাঁ"]
  },
  "খুলনা": {
    districts: ["খুলনা", "যশোর", "কুষ্টিয়া", "সাতক্ষীরা", "বাগেরহাট"]
  },
  "বরিশাল": {
    districts: ["বরিশাল", "পটুয়াখালী", "ভোলা", "পিরোজপুর", "ঝালকাঠি"]
  },
  "সিলেট": {
    districts: ["সিলেট", "মৌলভীবাজার", "হবিগঞ্জ", "সুনামগঞ্জ"]
  },
  "রংপুর": {
    districts: ["রংপুর", "দিনাজপুর", "গাইবান্ধা", "কুড়িগ্রাম", "লালমনিরহাট"]
  },
  "ময়মনসিংহ": {
    districts: ["ময়মনসিংহ", "জামালপুর", "নেত্রকোনা", "শেরপুর"]
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

export const hospitalsByDistrict: Record<string, string[]> = {
  "ঢাকা": [
    "ঢাকা মেডিকেল কলেজ হাসপাতাল",
    "বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয় (বিএসএমএমইউ)",
    "স্যার সলিমুল্লাহ মেডিকেল কলেজ হাসপাতাল (মিটফোর্ড)",
    "শহীদ সোহরাওয়ার্দী মেডিকেল কলেজ হাসপাতাল",
    "জাতীয় হৃদরোগ ইনস্টিটিউট ও হাসপাতাল (এনআইসিভিডি)",
    "জাতীয় অর্থোপেডিক হাসপাতাল ও পুনর্বাসন প্রতিষ্ঠান (নিটোর)",
    "স্কয়ার হাসপাতাল লিমিটেড",
    "এভারকেয়ার হাসপাতাল ঢাকা",
    "ইউনাইটেড হাসপাতাল লিমিটেড",
    "ল্যাবএইড বিশেষায়িত হাসপাতাল",
    "বারডেম জেনারেল হাসপাতাল",
    "সম্মিলিত সামরিক হাসপাতাল (সিএমএইচ), ঢাকা",
    "ইবনে সিনা বিশেষায়িত হাসপাতাল",
    "কুর্মিটোলা জেনারেল হাসপাতাল",
    "মুগদা মেডিকেল কলেজ হাসপাতাল"
  ],
  "চট্টগ্রাম": [
    "চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল",
    "জাতীয় ট্রপিক্যাল ও সংক্রামক ব্যাধি হাসপাতাল",
    "বিจিসি ট্রাস্ট মেডিকেল কলেজ হাসপাতাল",
    "চট্টগ্রাম জেনারেল হাসপাতাল",
    "এভারকেয়ার হাসপাতাল চট্টগ্রাম",
    "ইম্পেরিয়াল হাসপাতাল লিমিটেড",
    "ম্যাক্স হাসপাতাল ও ডায়াগনস্টিক লিমিটেড",
    "পার্কভিউ হাসপাতাল ও ডায়াগনস্টিক লিমিটেড",
    "সম্মিলিত সামরিক হাসপাতাল (সিএমএইচ), চট্টগ্রাম"
  ],
  "রাজশাহী": [
    "রাজশাহী মেডিকেল কলেজ হাসপাতাল",
    "রাজশাহী সেন্ট্রাল হাসপাতাল",
    "ইসলামী ব্যাংক মেডিকেল কলেজ হাসপাতাল, রাজশাহী",
    "শাহ মখদুম মেডিকেল কলেজ হাসপাতাল",
    "সম্মিলিত সামরিক হাসপাতাল (সিএমএইচ), বগুড়া"
  ],
  "খুলনা": [
    "খুলনা মেডিকেল কলেজ হাসপাতাল",
    "শহীদ শেখ আবু নাসের বিশেষায়িত হাসপাতাল",
    "খুলনা সিটি মেডিকেল কলেজ হাসপাতাল",
    "গাজী মেডিকেল কলেজ হাসপাতাল",
    "সম্মিলিত সামরিক হাসপাতাল (সিএমএইচ), যশোর"
  ],
  "সিলেট": [
    "সিলেট এম.এ.জি. ওসমানী মেডিকেল কলেজ হাসপাতাল",
    "নর্থ ইস্ট মেডিকেল কলেজ হাসপাতাল",
    "জালালাবাদ রাগীব-রাবেয়া মেডিকেল কলেজ হাসপাতাল",
    "সিলেট মহিলা মেডিকেল কলেজ হাসপাতাল",
    "মাউন্ট এডোরা হাসপাতাল"
  ],
  "বরিশাল": [
    "শের-ই-বাংলা মেডিকেল কলেজ হাসপাতাল (শেবাচিম)",
    "বরিশাল জেনারেল হাসপাতাল (সদর হাসপাতাল)",
    "ইসলামী ব্যাংক হাসপাতাল, বরিশাল",
    "রাহাত আনোয়ার হাসপাতাল"
  ],
  "রংপুর": [
    "রংপুর মেডিকেল কলেজ হাসপাতাল",
    "রংপুর জেনারেল হাসপাতাল",
    "প্রাইম মেডিকেল কলেজ হাসপাতাল",
    "নর্দান মেডিকেল কলেজ হাসপাতাল"
  ],
  "ময়মনসিংহ": [
    "ময়মনসিংহ মেডিকেল কলেজ হাসপাতাল",
    "কমিউনিটি বেজড মেডিকেল কলেজ হাসপাতাল (সিবিএমসি)",
    "নেক্সাস হাসপাতাল",
    "স্বদেশ হাসপাতাল"
  ],
  "কুমিল্লা": [
    "কুমিল্লা মেডিকেল কলেজ হাসপাতাল",
    "কুমিল্লা জেনারেল হাসপাতাল",
    "ইস্টার্ন মেডিকেল কলেজ হাসপাতাল",
    "মুন হাসপাতাল"
  ],
  "কক্সবাজার": [
    "কক্সবাজার সদর হাসপাতাল",
    "কক্সবাজার মেডিকেল কলেজ হাসপাতাল",
    "ইউনিয়ন হাসপাতাল",
    "ডিজিটাল হাসপাতাল",
    "হোপ হাসপাতাল"
  ],
  "যশোর": [
    "যশোর ২৫০ শয্যা জেনারেল হাসপাতাল",
    "যশোর মেডিকেল কলেজ হাসপাতাল",
    "আদ্-দ্বীন সকিনা মেডিকেল কলেজ হাসপাতাল",
    "কুইন্স হাসপাতাল"
  ],
  "গাজীপুর": [
    "শহীদ তাজউদ্দীন আহমদ মেডিকেল কলেজ হাসপাতাল",
    "তাইরুন্নেসা মেমোরিয়াল মেডিকেল কলেজ ও হাসপাতাল",
    "গাজীপুর সিটি মেডিকেল কলেজ ও হাসপাতাল"
  ],
  "নারায়ণগঞ্জ": [
    "নারায়ণগঞ্জ জেনারেল হাসপাতাল (ভিক্টোরিয়া হাসপাতাল)",
    "ইউএস-বাংলা মেডিকেল কলেজ ও হাসপাতাল",
    "মডার্ন হাসপাতাল নারায়ণগঞ্জ"
  ],
  "বগুড়া": [
    "শহীদ জিয়াউর রহমান মেডিকেল কলেজ হাসপাতাল",
    "মোহাম্মদ আলী হাসপাতাল",
    "টিএমএসএস মেডিকেল কলেজ ও রাফাতুল্লাহ কমিউনিটি হাসপাতাল"
  ]
};

// Deprecated, use hospitalsByDistrict instead.
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
  { value: "Comilla Medical College Hospital, Comilla", label: "Comilla Medical College Hospital, Comilla" },
  { value: "Cox's Bazar Sadar Hospital, Cox's Bazar", label: "Cox's Bazar Sadar Hospital, Cox's Bazar" },
  { value: "Cox's Bazar General Hospital, Cox's Bazar", label: "Cox's Bazar General Hospital, Cox's Bazar" },
  { value: "Union Hospital, Cox's Bazar", label: "Union Hospital, Cox's Bazar" },
  { value: "Cox's Bazar Central Hospital, Cox's Bazar", label: "Cox's Bazar Central Hospital, Cox's Bazar" },
  { value: "Digital Hospital, Cox's Bazar", label: "Digital Hospital, Cox's Bazar" },
  { value: "Hope Hospital, Cox's Bazar", label: "Hope Hospital, Cox's Bazar" }
];
