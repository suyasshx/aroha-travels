import { PrismaClient, UserRole, PackageStatus, EnquiryStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Aroha Travels database seed...");

  // 1. Clean existing records in reverse dependency order
  await prisma.activityLog.deleteMany({});
  await prisma.enquiryNote.deleteMany({});
  await prisma.aIExtraction.deleteMany({});
  await prisma.enquiry.deleteMany({});
  await prisma.packageVersion.deleteMany({});
  await prisma.hotel.deleteMany({});
  await prisma.itineraryDay.deleteMany({});
  await prisma.seasonalPrice.deleteMany({});
  await prisma.package.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Cleared existing database records.");

  // 2. Create Staff Admin and Demo Users
  const adminPasswordHash = await bcrypt.hash("ArohaAdmin2026!", 10);
  const adminUser = await prisma.user.create({
    data: {
      name: "Aroha Operations Admin",
      email: "admin@aroha.com",
      passwordHash: adminPasswordHash,
      role: UserRole.STAFF_ADMIN,
    },
  });

  const consultantPasswordHash = await bcrypt.hash("Consultant2026!", 10);
  const consultantUser = await prisma.user.create({
    data: {
      name: "Kavya Menon (Kerala Specialist)",
      email: "kavya@aroha.com",
      passwordHash: consultantPasswordHash,
      role: UserRole.STAFF_ADMIN,
    },
  });

  const travellerPasswordHash = await bcrypt.hash("Traveller2026!", 10);
  await prisma.user.create({
    data: {
      name: "Siddharth Verma",
      email: "siddharth@example.com",
      passwordHash: travellerPasswordHash,
      role: UserRole.TRAVELLER,
    },
  });

  console.log("Created users (Admin: admin@aroha.com / ArohaAdmin2026!)");

  // 3. Package 1: Munnar, Thekkady and Alleppey Houseboat (PK-KL-07)
  const pkg1 = await prisma.package.create({
    data: {
      packageCode: "PKG-KL-07",
      slug: "munnar-thekkady-alleppey-houseboat",
      title: "Munnar, Thekkady and Alleppey Houseboat",
      destination: "Munnar, Thekkady & Alleppey, Kerala",
      duration: "6 Days / 5 Nights",
      status: PackageStatus.PUBLISHED,
      featured: true,
      bestTimeToVisit: "September to March for pleasant weather; June to August for lush monsoon greenery.",
      heroImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1600&auto=format&fit=crop",
      description:
        "Immerse yourself in quintessential Kerala: misty rolling tea estates of Munnar, aromatic cardamom hills and wildlife sanctuaries of Thekkady, culminating in a leisurely overnight private cruise across the backwaters of Alleppey aboard a traditional Kettuvallam.",
      inclusions: [
        "Accommodation on twin-sharing basis in premium 4-star properties",
        "1 night stay in private traditional air-conditioned Deluxe Houseboat",
        "Daily buffet breakfast at hotels; all meals (Lunch, Evening Tea, Dinner, Breakfast) on Houseboat",
        "All transfers and sightseeing by private air-conditioned sedan / SUV",
        "Guided walk through aromatic organic spice plantation in Thekkady",
        "Entry permits and interstate road taxes",
        "24/7 dedicated local travel concierge assistance",
      ],
      exclusions: [
        "Airfare or train fare to / from Cochin International Airport",
        "Personal expenses (laundry, telephone calls, tips, alcoholic beverages)",
        "Optional Periyar boat safari tickets (can be arranged on request)",
        "Anything not explicitly mentioned under inclusions",
      ],
      gallery: [
        "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop",
      ],
      seasonalPrices: {
        create: [
          {
            seasonName: "Peak Season (Winter & Spring)",
            startDate: new Date("2026-10-01T00:00:00Z"),
            endDate: new Date("2027-03-31T23:59:59Z"),
            pricePerPerson: 32500,
            hotelCategory: "4-Star Deluxe Resorts",
            gstDetails: "5% GST applicable",
            sharingBasis: "Twin Sharing Basis",
          },
          {
            seasonName: "Monsoon Season (Ayurveda & Emerald Greenery)",
            startDate: new Date("2026-06-01T00:00:00Z"),
            endDate: new Date("2026-09-30T23:59:59Z"),
            pricePerPerson: 24900,
            hotelCategory: "4-Star Deluxe Resorts",
            gstDetails: "5% GST applicable",
            sharingBasis: "Twin Sharing Basis",
          },
          {
            seasonName: "Summer Season",
            startDate: new Date("2026-04-01T00:00:00Z"),
            endDate: new Date("2026-05-31T23:59:59Z"),
            pricePerPerson: 27500,
            hotelCategory: "4-Star Deluxe Resorts",
            gstDetails: "5% GST applicable",
            sharingBasis: "Twin Sharing Basis",
          },
        ],
      },
      hotels: {
        create: [
          {
            name: "Fragrant Nature Resort Munnar",
            category: "4-Star Deluxe",
            location: "Pothamedu, Munnar",
            roomType: "Tropic Green Room with Valley View",
          },
          {
            name: "Elephant Court & Spa",
            category: "4-Star Premium",
            location: "Thekkady, Periyar",
            roomType: "Patio Room overlooking Forest Canopy",
          },
          {
            name: "Aroha Heritage Private Kettuvallam",
            category: "Deluxe Air-Conditioned Houseboat",
            location: "Vembanad Lake, Alleppey",
            roomType: "Private Riverview Bedroom with Ensuite",
          },
        ],
      },
      itineraryDays: {
        create: [
          {
            dayNumber: 1,
            title: "Arrival in Cochin & Scenic Ascent to Munnar Tea Country",
            description:
              "Welcome to God's Own Country. Arrive at Cochin International Airport or Ernakulam Railway Station where your private chauffeur meets you. Embark on a breathtaking 4-hour scenic drive ascending the Western Ghats into Munnar, traversing rubber plantations and cascading mountain streams. Stop at the picturesque Cheeyappara and Valara waterfalls. Check into your mist-wrapped mountain resort and spend a tranquil evening strolling through fragrant tea estate trails.",
            activities: [
              "Private airport welcome and chauffeur introduction",
              "En-route scenic photo stop at Cheeyappara Waterfalls",
              "Check-in at premium valley-view resort in Munnar",
              "Evening leisure walk amidst manicured tea gardens",
            ],
            stay: "Fragrant Nature Resort, Munnar",
            meals: "Dinner",
          },
          {
            dayNumber: 2,
            title: "Munnar Tea Gardens, Eravikulam National Park & Mattupetty",
            description:
              "Rise early to the chorus of highland birds. Visit the renowned Eravikulam National Park (Rajamalai), sanctuary of the endangered Nilgiri Tahr mountain goat, boasting panoramic vantage points over Anamudi Peak. In the afternoon, explore the Tata Tea Museum to understand Kerala's historic tea processing heritage. Conclude with visits to Mattupetty Dam, Echo Point, and the tranquil Kundala Lake.",
            activities: [
              "Morning safari drive into Eravikulam National Park",
              "Spot endangered Nilgiri Tahr against panoramic mountain ridges",
              "Interactive artisanal tea tasting at Tea Heritage Museum",
              "Echo Point and Mattupetty Dam boat reservoir",
            ],
            stay: "Fragrant Nature Resort, Munnar",
            meals: "Breakfast & Dinner",
          },
          {
            dayNumber: 3,
            title: "Munnar to Thekkady Spice Plantations",
            description:
              "After a leisurely breakfast, drive south through scenic mountain passes towards Thekkady (Periyar), Kerala's spice capital. Breathe in the crisp air laden with natural aromas of cardamom, cinnamon, pepper, and cloves. Check into your forest-fringed resort. In the late afternoon, take an expert-guided walk through a biodynamic spice plantation and witness an authentic evening performance of Kalaripayattu, the world's oldest martial art.",
            activities: [
              "Scenic hillside drive from Munnar to Periyar (approx. 3.5 hrs)",
              "Guided sensory walk through organic spice plantation",
              "Learn traditional medicinal uses of pepper, cardamom and nutmeg",
              "Traditional evening Kalaripayattu martial art display",
            ],
            stay: "Elephant Court & Spa, Thekkady",
            meals: "Breakfast & Dinner",
          },
          {
            dayNumber: 4,
            title: "Periyar Wildlife Sanctuary & Forest Immersion",
            description:
              "Embark on an early morning boat cruise on Periyar Lake inside the Periyar Tiger Reserve. Observe wild herds of Asiatic elephants, sambar deer, gaur, and exotic water birds congregating along the forested water shores. Spend the afternoon exploring local spice markets in Kumily or indulging in a restorative Ayurvedic rejuvenating massage at the resort spa.",
            activities: [
              "Morning nature boat safari on Periyar Lake",
              "Bird watching and wildlife observation along sanctuary banks",
              "Afternoon spice market walk in Kumily bazaar",
              "Optional authentic Ayurvedic Abhyanga herbal therapy",
            ],
            stay: "Elephant Court & Spa, Thekkady",
            meals: "Breakfast & Dinner",
          },
          {
            dayNumber: 5,
            title: "Thekkady to Alleppey – Traditional Kettuvallam Houseboat Stay",
            description:
              "Descend from the misty hills toward the serene backwaters of Alleppey. Board your private traditional thatched Kettuvallam houseboat by midday. Glide past village settlements, emerald paddy fields lying below sea level, coir-making workshops, and gliding canoe fishers. Enjoy a traditional Karimeen (pearl spot fish) and coconut-infused Kerala lunch freshly prepared on board by your private onboard chef. Moor peacefully on the lake as the sun sets over the palm horizon.",
            activities: [
              "Scenic descent to the backwater canals of Alleppey",
              "Traditional welcome with fresh tender coconut water",
              "Private leisurely cruise through narrow canal networks and Vembanad Lake",
              "Freshly prepared Kerala banana-leaf lunch and dinner by private chef",
              "Overnight tranquil mooring under starry rural skies",
            ],
            stay: "Aroha Heritage Private Houseboat, Alleppey",
            meals: "Breakfast, Traditional Kerala Lunch, Evening Tea & Dinner",
          },
          {
            dayNumber: 6,
            title: "Alleppey Backwaters Sunrise & Departure via Cochin",
            description:
              "Awaken to the golden sun rising through the swaying coconut palms as village life stirs along the canals. Relish a wholesome South Indian breakfast of appams and stew while cruising towards the jetty. Disembark at 09:30 AM and transfer back to Cochin (approx. 2 hours). Depending on your flight schedule, explore the iconic Chinese Fishing Nets and Jewish Synagogue in Fort Kochi before dropping off at Cochin International Airport.",
            activities: [
              "Early morning sunrise cruise and village photography",
              "Hearty Kerala breakfast on the backwaters",
              "Disembarkation and transfer to Cochin Airport / Railway Station",
              "Complimentary heritage brief in historic Fort Kochi (subject to flight schedule)",
            ],
            stay: "Departure Day",
            meals: "Breakfast",
          },
        ],
      },
    },
  });

  // Package 1 Version 1 Snapshot
  await prisma.packageVersion.create({
    data: {
      packageId: pkg1.id,
      versionNumber: 1,
      snapshot: {
        packageCode: pkg1.packageCode,
        title: pkg1.title,
        destination: pkg1.destination,
        duration: pkg1.duration,
        status: pkg1.status,
        peakPrice: 32500,
        monsoonPrice: 24900,
      },
      changeSummary: "Initial curated package release with 4-star hotels and verified seasonal rates.",
      updatedBy: "admin@aroha.com",
    },
  });

  // 4. Package 2: Madurai, Rameswaram and Kanyakumari (PKG-SI-12)
  const pkg2 = await prisma.package.create({
    data: {
      packageCode: "PKG-SI-12",
      slug: "madurai-rameswaram-kanyakumari",
      title: "Madurai, Rameswaram and Kanyakumari",
      destination: "Madurai, Rameswaram & Kanyakumari, Tamil Nadu",
      duration: "5 Days / 4 Nights",
      status: PackageStatus.DRAFT,
      featured: false,
      bestTimeToVisit: "October to March when temperatures are mild and pleasant for temple exploration.",
      heroImage: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1600&auto=format&fit=crop",
      description:
        "A transformative journey across the spiritual heartland of South India: marvel at the majestic Dravidian gopurams of Madurai's Meenakshi Amman Temple, cross the engineering wonder of Pamban Sea Bridge to sacred Rameswaram, and stand at Land's End in Kanyakumari where three mighty oceans converge.",
      inclusions: [
        "4 nights accommodation in handpicked 3-star standard comfort hotels",
        "Daily vegetarian / multi-cuisine breakfast",
        "Exclusive private air-conditioned vehicle for all intercity travel and temple tours",
        "Assistance at all temple checkpoints and sacred ghats",
        "Toll taxes, parking fees, and driver allowances",
      ],
      exclusions: [
        "Train / Flight fares to Madurai and from Trivandrum",
        "Special temple pooja tickets or direct VIP darshan passes",
        "Boating charges at Kanyakumari Vivekananda Rock Memorial",
        "GST at 5%",
      ],
      gallery: [
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1609137144822-0d1279bc984d?q=80&w=1200&auto=format&fit=crop",
      ],
      seasonalPrices: {
        create: [
          {
            seasonName: "All-Year Standard Price",
            startDate: new Date("2026-01-01T00:00:00Z"),
            endDate: new Date("2026-12-31T23:59:59Z"),
            pricePerPerson: 18750,
            hotelCategory: "3-Star Standard Comfort",
            gstDetails: "5% GST applicable",
            sharingBasis: "Twin Sharing Basis",
          },
        ],
      },
      hotels: {
        create: [
          {
            name: "Heritage Residency Madurai",
            category: "3-Star Standard",
            location: "Madurai City",
            roomType: "Executive AC Room",
          },
          {
            name: "Daiwik Hotel Rameswaram",
            category: "3-Star Pilgrim Boutique",
            location: "Rameswaram Island",
            roomType: "Standard Temple View Room",
          },
          {
            name: "Sparsa Resort Kanyakumari",
            category: "3-Star Deluxe Oceanfront",
            location: "Kanyakumari Coast",
            roomType: "Sea Breeze Room",
          },
        ],
      },
      itineraryDays: {
        create: [
          {
            dayNumber: 1,
            title: "Arrival in Madurai & Meenakshi Amman Temple",
            description:
              "Arrive at Madurai Airport or Railway Station. Check into your hotel. In the afternoon, visit the historic Thirumalai Nayakkar Palace showcasing ornate Indo-Saracenic stuccowork. In the evening, enter the magnificent Madurai Meenakshi Amman Temple to witness the awe-inspiring 14 soaring gopurams and attend the night palliyarai ceremony.",
            activities: [
              "Pickup from Madurai Airport / Station",
              "Tour of Thirumalai Nayakar Mahal Palace",
              "Evening darshan at Meenakshi Amman Temple",
            ],
            stay: "Heritage Residency, Madurai",
            meals: "Breakfast",
          },
          {
            dayNumber: 2,
            title: "Madurai to Rameswaram Island & Pamban Bridge",
            description:
              "Drive across the legendary Pamban Sea Bridge onto the sacred island of Rameswaram. Visit Ramanathaswamy Temple featuring the longest corridor of 1,212 intricately carved granite pillars in the world. Perform traditional holy bathing ritual across the 22 sacred theerthams.",
            activities: [
              "Scenic drive over the Pamban cantilever railway bridge",
              "Darshan at Ramanathaswamy Temple",
              "Walk along the 1,000-pillar corridor",
            ],
            stay: "Daiwik Hotel, Rameswaram",
            meals: "Breakfast",
          },
          {
            dayNumber: 3,
            title: "Dhanushkodi Ghost Town & Journey to Kanyakumari",
            description:
              "Early morning excursion to Dhanushkodi, the legendary lost town submerged in the 1964 cyclone, standing where the Bay of Bengal meets the Indian Ocean. In the afternoon, embark on a picturesque coastal drive south to Kanyakumari, India's southernmost tip. Watch the sun dip into the horizon.",
            activities: [
              "Off-road drive to the ruins of Dhanushkodi and Ram Setu viewpoint",
              "Drive southward to Kanyakumari",
              "Sunset viewing at Triveni Sangam",
            ],
            stay: "Sparsa Resort, Kanyakumari",
            meals: "Breakfast",
          },
          {
            dayNumber: 4,
            title: "Kanyakumari Sunrise, Vivekananda Rock & Suchindram",
            description:
              "Witness the unforgettable sunrise over the triple ocean expanse. Board a ferry to the iconic Vivekananda Rock Memorial and Thiruvalluvar Statue. Later in the day, visit the Gandhi Memorial Mandapam and the 9th-century Suchindram Thanumalayan Temple renowned for its musical pillars.",
            activities: [
              "Panoramic multi-ocean sunrise view",
              "Ferry boat ride to Vivekananda Rock Memorial",
              "Explore Suchindram musical pillars temple",
            ],
            stay: "Sparsa Resort, Kanyakumari",
            meals: "Breakfast",
          },
          {
            dayNumber: 5,
            title: "Kanyakumari to Trivandrum & Departure",
            description:
              "After breakfast, drive along the palm-lined coastal corridor to Trivandrum (approx. 2.5 hours). Stop at the historic Padmanabhapuram Wooden Palace. Drop off at Trivandrum Airport or Railway Station for your onward journey home.",
            activities: [
              "Guided walk through Padmanabhapuram Wooden Palace",
              "Drop off at Trivandrum International Airport",
            ],
            stay: "Departure Day",
            meals: "Breakfast",
          },
        ],
      },
    },
  });

  // Package 2 Draft Version
  await prisma.packageVersion.create({
    data: {
      packageId: pkg2.id,
      versionNumber: 1,
      snapshot: {
        packageCode: pkg2.packageCode,
        title: pkg2.title,
        destination: pkg2.destination,
        duration: pkg2.duration,
        status: pkg2.status,
        price: 18750,
      },
      changeSummary: "Draft creation of South India temple circuit package awaiting final hotel contracts.",
      updatedBy: "admin@aroha.com",
    },
  });

  // 5. Package 3: Wayanad Rainforests & Heritage Hideaway (PKG-KL-03)
  const pkg3 = await prisma.package.create({
    data: {
      packageCode: "PKG-KL-03",
      slug: "wayanad-rainforests-heritage-hideaway",
      title: "Wayanad Rainforests & Heritage Hideaway",
      destination: "Wayanad, Northern Kerala",
      duration: "4 Days / 3 Nights",
      status: PackageStatus.PUBLISHED,
      featured: true,
      bestTimeToVisit: "October to May for cool weather; June to September for dramatic mist and waterfalls.",
      heroImage: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1600&auto=format&fit=crop",
      description:
        "Discover the untamed wilderness of Northern Kerala. Stay in eco-conscious luxury treehouses and forest villas, hike to prehistoric Edakkal rock caves, trek through bamboo groves, and unwind beside Meenmutty waterfalls.",
      inclusions: [
        "3 nights in premium rainforest eco-resort",
        "Daily organic plantation-to-table breakfast and dinner",
        "Guided trek to Edakkal Caves and Soochipara Falls",
        "Bamboo rafting on Kuruva Island",
        "Private AC SUV transfers from Calicut Airport",
      ],
      exclusions: ["Flights", "Personal tips and camera permits", "GST at 5%"],
      gallery: [
        "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
      ],
      seasonalPrices: {
        create: [
          {
            seasonName: "Winter & Summer Peak",
            startDate: new Date("2026-09-01T00:00:00Z"),
            endDate: new Date("2027-05-31T23:59:59Z"),
            pricePerPerson: 21500,
            hotelCategory: "4-Star Rainforest Eco-Resort",
            gstDetails: "5% GST applicable",
            sharingBasis: "Twin Sharing Basis",
          },
          {
            seasonName: "Monsoon Romance Season",
            startDate: new Date("2026-06-01T00:00:00Z"),
            endDate: new Date("2026-08-31T23:59:59Z"),
            pricePerPerson: 16900,
            hotelCategory: "4-Star Rainforest Eco-Resort",
            gstDetails: "5% GST applicable",
            sharingBasis: "Twin Sharing Basis",
          },
        ],
      },
      hotels: {
        create: [
          {
            name: "Vythiri Rainforest Village",
            category: "4-Star Eco Luxury",
            location: "Vythiri, Wayanad",
            roomType: "Canopy Villa",
          },
        ],
      },
      itineraryDays: {
        create: [
          {
            dayNumber: 1,
            title: "Calicut to Wayanad Rainforest Ascent",
            description: "Scenic drive ascending Thamarassery Churam hairpin curves into foggy rainforests.",
            activities: ["Churam viewpoint photo stop", "Check-in at rainforest villa", "Evening plantation walk"],
            stay: "Vythiri Village",
            meals: "Dinner",
          },
          {
            dayNumber: 2,
            title: "Prehistoric Edakkal Caves & Banasura Sagar Dam",
            description: "Explore 6,000-year-old Neolithic petroglyphs and Asia's largest earth dam.",
            activities: ["Morning hike to Edakkal Caves", "Speed boating at Banasura Sagar Lake"],
            stay: "Vythiri Village",
            meals: "Breakfast & Dinner",
          },
          {
            dayNumber: 3,
            title: "Kuruva Island Bamboo Rafting & Waterfall Walk",
            description: "Glide across dense evergreen river islands on sustainable bamboo rafts.",
            activities: ["Bamboo river rafting", "Soochipara natural plunge pool walk"],
            stay: "Vythiri Village",
            meals: "Breakfast & Dinner",
          },
          {
            dayNumber: 4,
            title: "Tea Factory Visit & Departure via Calicut",
            description: "Morning heritage tea tasting before transferring down to Calicut Airport.",
            activities: ["Artisanal tea tasting", "Transfer to Calicut Airport"],
            stay: "Departure",
            meals: "Breakfast",
          },
        ],
      },
    },
  });

  // Package 3 Version 1 Snapshot
  await prisma.packageVersion.create({
    data: {
      packageId: pkg3.id,
      versionNumber: 1,
      snapshot: {
        packageCode: pkg3.packageCode,
        title: pkg3.title,
        destination: pkg3.destination,
        duration: pkg3.duration,
        status: pkg3.status,
        price: 21500,
      },
      changeSummary: "Curated 4-day eco-wellness package published.",
      updatedBy: "kavya@aroha.com",
    },
  });

  // 6. Package 4: Grand Kerala Odyssey (PKG-KL-09)
  const pkg4 = await prisma.package.create({
    data: {
      packageCode: "PKG-KL-09",
      slug: "grand-kerala-odyssey-kochi-munnar-alleppey-marari",
      title: "Grand Kerala Odyssey: Kochi, Munnar, Thekkady, Alleppey & Marari Beach",
      destination: "Fort Kochi, Munnar, Thekkady, Alleppey & Marari, Kerala",
      duration: "8 Days / 7 Nights",
      status: PackageStatus.PUBLISHED,
      featured: true,
      bestTimeToVisit: "October to April for serene ocean tides and clear mountain horizons.",
      heroImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&auto=format&fit=crop",
      description:
        "The quintessential luxury grand tour of Kerala: colonial Fort Kochi art trails, dramatic Munnar tea valleys, Thekkady spice reserves, private Vembanad houseboat cruising, and ending with two restorative nights at a pristine Marari beach resort.",
      inclusions: [
        "7 nights in 5-star boutique heritage and beachfront resorts",
        "1 night exclusive Ultra-Luxury Houseboat stay with private chef and captain",
        "All meals on houseboat, daily lavish breakfasts and selected chef-curated dinners",
        "Private Mercedes / Innova Crysta throughout with dedicated chauffeur-concierge",
        "Complimentary 60-min Ayurvedic rejuvenation therapy for 2 guests",
        "All entrance passes, taxes, and airport transfers",
      ],
      exclusions: ["International/Domestic flights", "Alcoholic beverages", "GST at 5%"],
      gallery: [
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1200&auto=format&fit=crop",
      ],
      seasonalPrices: {
        create: [
          {
            seasonName: "Winter Peak Season",
            startDate: new Date("2026-10-01T00:00:00Z"),
            endDate: new Date("2027-03-31T23:59:59Z"),
            pricePerPerson: 58000,
            hotelCategory: "5-Star Luxury Boutique & Heritage",
            gstDetails: "5% GST applicable",
            sharingBasis: "Twin Sharing Basis",
          },
          {
            seasonName: "Summer & Monsoon Season",
            startDate: new Date("2026-04-01T00:00:00Z"),
            endDate: new Date("2026-09-30T23:59:59Z"),
            pricePerPerson: 44500,
            hotelCategory: "5-Star Luxury Boutique & Heritage",
            gstDetails: "5% GST applicable",
            sharingBasis: "Twin Sharing Basis",
          },
        ],
      },
      hotels: {
        create: [
          {
            name: "Brunton Boatyard (CGH Earth)",
            category: "5-Star Heritage",
            location: "Fort Kochi",
            roomType: "Sea-Facing Colonial Suite",
          },
          {
            name: "Windermere Estate",
            category: "5-Star Boutique Estate",
            location: "Munnar",
            roomType: "Planter's Villa",
          },
          {
            name: "Marari Beach Resort",
            category: "5-Star Eco Beachfront",
            location: "Mararikulam Beach",
            roomType: "Garden Villa with Private Pool",
          },
        ],
      },
      itineraryDays: {
        create: [
          {
            dayNumber: 1,
            title: "Colonial Fort Kochi & Sunset Harbor Cruise",
            description: "Explore Dutch and Portuguese history, Chinese fishing nets, and Jewish town.",
            activities: ["Heritage walking tour", "Chinese fishing nets sunset boat cruise"],
            stay: "Brunton Boatyard",
            meals: "Dinner",
          },
          {
            dayNumber: 2,
            title: "Fort Kochi to High Ranges of Munnar",
            description: "Ascend to tranquil planter estates in the misty Western Ghats.",
            activities: ["Scenic mountain drive", "Planter's afternoon tea session"],
            stay: "Windermere Estate",
            meals: "Breakfast & Dinner",
          },
          {
            dayNumber: 3,
            title: "Munnar Tea Exploration & Eravikulam Sanctuary",
            description: "Witness rare mountain wildlife and emerald tea landscapes.",
            activities: ["Eravikulam National Park tour", "Private tea tasting"],
            stay: "Windermere Estate",
            meals: "Breakfast & Dinner",
          },
          {
            dayNumber: 4,
            title: "Thekkady Spice Trails & Periyar Boat Cruise",
            description: "Discover spice hills and Periyar lake wildlife.",
            activities: ["Periyar boat safari", "Private spice estate tour"],
            stay: "Spice Village, Thekkady",
            meals: "Breakfast & Dinner",
          },
          {
            dayNumber: 5,
            title: "Alleppey Luxury Private Houseboat Cruise",
            description: "Board private luxury Kettuvallam across the tranquil Vembanad Lake.",
            activities: ["Backwaters cruise", "Fresh seafood lunch prepared by private chef"],
            stay: "Private Luxury Houseboat",
            meals: "All Meals",
          },
          {
            dayNumber: 6,
            title: "Alleppey to Marari Beach Resort",
            description: "Check into serene beach cottages along golden Malabar shores.",
            activities: ["Disembark houseboat", "Beachfront sunset walk"],
            stay: "Marari Beach Resort",
            meals: "Breakfast & Dinner",
          },
          {
            dayNumber: 7,
            title: "Marari Beach & Ayurvedic Wellness",
            description: "Full day of beach relaxation and rejuvenating Ayurvedic spa treatments.",
            activities: ["Ayurvedic couple massage", "Organic village farm walk"],
            stay: "Marari Beach Resort",
            meals: "Breakfast & Dinner",
          },
          {
            dayNumber: 8,
            title: "Marari Beach to Cochin Airport Departure",
            description: "Leisurely breakfast by the sea before transferring to Cochin Airport.",
            activities: ["Breakfast by the Arabian Sea", "Chauffeur transfer to airport"],
            stay: "Departure",
            meals: "Breakfast",
          },
        ],
      },
    },
  });

  // Package 4 Version 1 Snapshot
  await prisma.packageVersion.create({
    data: {
      packageId: pkg4.id,
      versionNumber: 1,
      snapshot: {
        packageCode: pkg4.packageCode,
        title: pkg4.title,
        destination: pkg4.destination,
        duration: pkg4.duration,
        status: pkg4.status,
        price: 58000,
      },
      changeSummary: "Flagship 8-day luxury Kerala Odyssey launched.",
      updatedBy: "admin@aroha.com",
    },
  });

  console.log("Created 4 detailed packages (3 Published, 1 Draft).");

  // 7. Seed 8 Realistic Customer Enquiries
  const sampleEnquiries = [
    {
      enquiryNumber: "ENQ-2026-001",
      customerName: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      phone: "+91 98201 12345",
      destination: "Kerala",
      travelStartDate: new Date("2026-12-15T00:00:00Z"),
      travelEndDate: new Date("2026-12-21T00:00:00Z"),
      duration: "5-6 nights",
      adults: 2,
      children: 1,
      budget: 120000,
      specialRequirements: "Houseboat a must, child-friendly vehicle with car seat if possible, vegetarian meals on boat.",
      originalMessage: "Hi, 2 adults and 1 kid, Kerala 5-6 nights in December, budget around 1.2 lakh total, houseboat a must.",
      preferredContactMethod: "WHATSAPP",
      whatsappConsent: true,
      status: EnquiryStatus.NEW,
      priority: "HIGH",
      assignedTo: "Kavya Menon",
      createdAt: new Date(Date.now() - 1000 * 60 * 35), // 35 mins ago
      aiExtraction: {
        extractedData: {
          destination: "Kerala",
          adults: 2,
          children: 1,
          duration: "5-6 nights",
          travel_month: "December",
          budget: 120000,
          special_requirements: ["Houseboat", "Child friendly", "Vegetarian food"],
          confidence: 0.96,
        },
        confidence: 0.96,
        recommendations: [
          {
            packageId: pkg1.id,
            packageCode: pkg1.packageCode,
            title: pkg1.title,
            matchScore: 0.98,
            seasonMatched: "Peak Season (Winter & Spring)",
            pricePerPerson: 32500,
            estimatedTotal: 81250,
            reason: "Perfect 6-day duration match covering Munnar, Thekkady and requested private Alleppey houseboat within the ₹1.2 lakh budget.",
          },
          {
            packageId: pkg3.id,
            packageCode: pkg3.packageCode,
            title: pkg3.title,
            matchScore: 0.72,
            seasonMatched: "Winter & Summer Peak",
            pricePerPerson: 21500,
            estimatedTotal: 53750,
            reason: "Good alternative scenic Kerala option, though doesn't include houseboat.",
          },
        ],
        replyDraft:
          "Dear Mr. Rahul Sharma,\n\nGreetings from Aroha Travels! Thank you for reaching out to us for your family journey to Kerala this December.\n\nBased on your requirement for 2 adults and 1 child with an overnight houseboat cruise, we are delighted to recommend our flagship 'Munnar, Thekkady and Alleppey Houseboat' (6 Days / 5 Nights). In December peak season, this package starts at ₹32,500 per person on twin-sharing basis (plus 5% GST), comfortably fitting within your ₹1,20,000 family budget while including a private Deluxe Kettuvallam with customized vegetarian dining.\n\nWould you like us to customize this itinerary with a dedicated child seat and specific hotel room arrangements?\n\nWarm regards,\nKavya Menon\nKerala Specialist, Aroha Travels",
        approved: false,
        provider: "gemini-1.5-flash",
      },
      notes: [
        {
          authorName: "Kavya Menon",
          note: "Enquiry flagged as high priority due to December peak dates. Verified houseboat availability with backwater fleet partner.",
          createdAt: new Date(Date.now() - 1000 * 60 * 20),
        },
      ],
    },
    {
      enquiryNumber: "ENQ-2026-002",
      customerName: "Priya Nair",
      email: "priya.nair@example.com",
      phone: "+91 94471 23456",
      destination: "Munnar & Alleppey",
      travelStartDate: new Date("2026-10-10T00:00:00Z"),
      travelEndDate: new Date("2026-10-16T00:00:00Z"),
      duration: "6 days",
      adults: 2,
      children: 0,
      budget: 90000,
      specialRequirements: "Honeymoon special setup with candle-light dinner on houseboat and flower bed decoration.",
      originalMessage: "Planning our honeymoon in Kerala this October. Want romantic tea garden resort in Munnar and private luxury houseboat. Budget approx 90k for both of us.",
      preferredContactMethod: "EMAIL",
      whatsappConsent: false,
      status: EnquiryStatus.CONTACTED,
      priority: "HIGH",
      assignedTo: "Kavya Menon",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      aiExtraction: {
        extractedData: {
          destination: "Munnar & Alleppey",
          adults: 2,
          children: 0,
          duration: "6 days",
          travel_month: "October",
          budget: 90000,
          special_requirements: ["Honeymoon", "Candle-light dinner", "Flower bed decoration", "Private houseboat"],
          confidence: 0.94,
        },
        confidence: 0.94,
        recommendations: [
          {
            packageId: pkg1.id,
            packageCode: pkg1.packageCode,
            title: pkg1.title,
            matchScore: 0.95,
            seasonMatched: "Peak Season (Winter & Spring)",
            pricePerPerson: 32500,
            estimatedTotal: 65000,
            reason: "Ideal 6-day honeymoon itinerary covering Munnar mountain resort and private Alleppey houseboat under the ₹90,000 budget.",
          },
        ],
        replyDraft:
          "Dear Priya,\n\nHeartiest congratulations on your upcoming wedding! We would love to curate a memorable honeymoon for you in God's Own Country.\n\nOur 'Munnar, Thekkady and Alleppey Houseboat' package perfectly matches your October dates at ₹32,500 per person on twin-sharing (total ₹65,000 + GST for the couple), well within your ₹90,000 budget. We have also included complimentary honeymoon inclusions: a candle-light dinner and fresh floral decor aboard your private Kettuvallam.\n\nLet us know if you would like to proceed with holding the room at Fragrant Nature Resort Munnar.\n\nWarm regards,\nKavya Menon, Aroha Travels",
        approved: true,
        provider: "gemini-1.5-flash",
      },
      notes: [
        {
          authorName: "Kavya Menon",
          note: "Called customer at 2 PM. Confirmed October 10 travel dates. Honeymoon inclusions noted.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        },
      ],
    },
    {
      enquiryNumber: "ENQ-2026-003",
      customerName: "Amitabh Sen",
      email: "amitabh.sen@example.com",
      phone: "+91 98300 56789",
      destination: "Tamil Nadu Pilgrim Circuit",
      travelStartDate: new Date("2026-11-20T00:00:00Z"),
      travelEndDate: new Date("2026-11-25T00:00:00Z"),
      duration: "5 days",
      adults: 4,
      children: 0,
      budget: 100000,
      specialRequirements: "Senior citizens travelling. Need ground floor hotel rooms, wheel-chair friendly access at temples, and low-step private vehicle.",
      originalMessage: "Hello, looking for temple trip for 4 senior citizens (65+ yrs). Need Madurai Meenakshi, Rameswaram and Kanyakumari. Low walking, good AC car, budget around 1 lakh total in November.",
      preferredContactMethod: "PHONE",
      whatsappConsent: true,
      status: EnquiryStatus.QUALIFIED,
      priority: "MEDIUM",
      assignedTo: "Aroha Operations Admin",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
      aiExtraction: {
        extractedData: {
          destination: "Madurai, Rameswaram & Kanyakumari",
          adults: 4,
          children: 0,
          duration: "5 days",
          travel_month: "November",
          budget: 100000,
          special_requirements: ["Senior citizens (65+)", "Ground floor rooms", "Wheelchair assistance", "Low-step vehicle"],
          confidence: 0.95,
        },
        confidence: 0.95,
        recommendations: [
          {
            packageId: pkg2.id,
            packageCode: pkg2.packageCode,
            title: pkg2.title,
            matchScore: 0.99,
            seasonMatched: "All-Year Standard Price",
            pricePerPerson: 18750,
            estimatedTotal: 75000,
            reason: "Exact 5-day route covering Madurai, Rameswaram, and Kanyakumari at ₹18,750 per person (total ₹75,000 for 4 adults).",
          },
        ],
        replyDraft:
          "Dear Mr. Amitabh Sen,\n\nGreetings from Aroha Travels. We specialize in comfortable, well-paced spiritual journeys tailored for senior travellers.\n\nOur 'Madurai, Rameswaram and Kanyakumari' 5-day journey is priced at ₹18,750 per person on twin-sharing basis (Total ₹75,000 + GST for 4 adults). We will ensure ground floor hotel rooms, priority temple darshan assistance, and an Innova Crysta with low footboard steps for easy boarding.\n\nOur senior guest coordinator will call you to discuss your exact timing preferences.\n\nWarm regards,\nAroha Travels Team",
        approved: false,
        provider: "rule-based-fallback",
      },
      notes: [],
    },
    {
      enquiryNumber: "ENQ-2026-004",
      customerName: "Ananya Deshmukh",
      email: "ananya.d@example.com",
      phone: "+91 98220 98765",
      destination: "Wayanad",
      travelStartDate: new Date("2026-07-15T00:00:00Z"),
      travelEndDate: new Date("2026-07-19T00:00:00Z"),
      duration: "4 days",
      adults: 1,
      children: 0,
      budget: 35000,
      specialRequirements: "Solo traveler interested in monsoon landscape photography, bird watching, and quiet nature trails.",
      originalMessage: "Hi Aroha, solo female photographer looking for a 4 day monsoon escape in Wayanad this July. Want mist, lush green plantations, and quiet eco resort. Budget around 35k.",
      preferredContactMethod: "EMAIL",
      whatsappConsent: true,
      status: EnquiryStatus.QUOTATION_SENT,
      priority: "MEDIUM",
      assignedTo: "Kavya Menon",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28), // 28 hours ago
      aiExtraction: {
        extractedData: {
          destination: "Wayanad",
          adults: 1,
          children: 0,
          duration: "4 days",
          travel_month: "July",
          budget: 35000,
          special_requirements: ["Solo traveler", "Monsoon photography", "Bird watching", "Eco resort"],
          confidence: 0.93,
        },
        confidence: 0.93,
        recommendations: [
          {
            packageId: pkg3.id,
            packageCode: pkg3.packageCode,
            title: pkg3.title,
            matchScore: 0.96,
            seasonMatched: "Monsoon Romance Season",
            pricePerPerson: 16900,
            estimatedTotal: 25350,
            reason: "Matches Wayanad destination and July monsoon season at discounted monsoon rate of ₹16,900 per person.",
          },
        ],
        replyDraft:
          "Dear Ananya,\n\nJuly is truly the most poetic time to experience Wayanad's emerald valleys. Our 'Wayanad Rainforests & Heritage Hideaway' (4 Days / 3 Nights) at our eco-resort Vythiri Village is currently priced at our special Monsoon rate of ₹16,900 per person on twin-sharing (Single occupancy surcharge approx 50%, estimated total ₹25,350 + GST).\n\nWe have sent you the detailed photo-itinerary and driver details via email.\n\nWarm regards,\nKavya Menon, Aroha Travels",
        approved: true,
        provider: "gemini-1.5-flash",
      },
      notes: [
        {
          authorName: "Kavya Menon",
          note: "Quotation with solo occupancy tariff sent via email on July monsoon package.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        },
      ],
    },
    {
      enquiryNumber: "ENQ-2026-005",
      customerName: "Vikram Malhotra",
      email: "vikram.malhotra@example.com",
      phone: "+91 99100 45678",
      destination: "Complete Kerala Luxury",
      travelStartDate: new Date("2026-12-22T00:00:00Z"),
      travelEndDate: new Date("2026-12-30T00:00:00Z"),
      duration: "8 days",
      adults: 2,
      children: 2,
      budget: 280000,
      specialRequirements: "Christmas week travel. 5-star properties only (Brunton Boatyard, Windermere, Marari Beach). Premium private houseboat.",
      originalMessage: "Looking for an ultra-luxury 8 day Kerala journey for family of 4 (2 adults, kids 8 & 12) during Christmas week (Dec 22-30). Budget up to 2.8 lakhs. Top tier 5 star boutique hotels.",
      preferredContactMethod: "PHONE",
      whatsappConsent: true,
      status: EnquiryStatus.CONVERTED,
      priority: "HIGH",
      assignedTo: "Aroha Operations Admin",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50), // 50 hours ago
      aiExtraction: {
        extractedData: {
          destination: "Kerala Luxury (Kochi, Munnar, Thekkady, Alleppey, Marari)",
          adults: 2,
          children: 2,
          duration: "8 days",
          travel_month: "December",
          budget: 280000,
          special_requirements: ["5-star properties", "Christmas week", "Family of 4", "Marari beach resort"],
          confidence: 0.98,
        },
        confidence: 0.98,
        recommendations: [
          {
            packageId: pkg4.id,
            packageCode: pkg4.packageCode,
            title: pkg4.title,
            matchScore: 0.99,
            seasonMatched: "Winter Peak Season",
            pricePerPerson: 58000,
            estimatedTotal: 232000,
            reason: "Matches all 5-star properties, 8-day duration and December peak dates at ₹58,000 per person.",
          },
        ],
        replyDraft:
          "Dear Mr. Vikram Malhotra,\n\nThank you for choosing Aroha Travels. Our 'Grand Kerala Odyssey' (8 Days / 7 Nights) is tailor-made for your Christmas holiday, featuring Brunton Boatyard in Kochi, Windermere Estate in Munnar, an Ultra-Luxury private Kettuvallam, and Marari Beach Resort. Base pricing is ₹58,000 per adult on twin-sharing + child supplement.\n\nWarm regards,\nAroha Operations Admin",
        approved: true,
        provider: "gemini-1.5-flash",
      },
      notes: [
        {
          authorName: "Aroha Operations Admin",
          note: "Booking confirmed! Advance deposit received. Vouchers issued for Brunton Boatyard and Marari Beach Resort.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        },
      ],
    },
    {
      enquiryNumber: "ENQ-2026-006",
      customerName: "Sneha & Rohan Patel",
      email: "sneha.patel@example.com",
      phone: "+91 97123 67890",
      destination: "Kerala Nature & Hills",
      travelStartDate: new Date("2027-01-10T00:00:00Z"),
      travelEndDate: new Date("2027-01-16T00:00:00Z"),
      duration: "6 days",
      adults: 2,
      children: 0,
      budget: 70000,
      specialRequirements: "Scenic mountain drives, plantation walks, tea tasting. Houseboat optional.",
      originalMessage: "Hi! Couple from Ahmedabad planning 6 days in Kerala in January. Main focus on Munnar tea valleys and cool weather. Budget approx 70,000.",
      preferredContactMethod: "WHATSAPP",
      whatsappConsent: true,
      status: EnquiryStatus.NEW,
      priority: "MEDIUM",
      assignedTo: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      aiExtraction: {
        extractedData: {
          destination: "Munnar & Kerala Hills",
          adults: 2,
          children: 0,
          duration: "6 days",
          travel_month: "January",
          budget: 70000,
          special_requirements: ["Scenic mountain drives", "Tea tasting", "Plantation walk"],
          confidence: 0.92,
        },
        confidence: 0.92,
        recommendations: [
          {
            packageId: pkg1.id,
            packageCode: pkg1.packageCode,
            title: pkg1.title,
            matchScore: 0.93,
            seasonMatched: "Peak Season (Winter & Spring)",
            pricePerPerson: 32500,
            estimatedTotal: 65000,
            reason: "Fits 6-day duration with Munnar tea gardens and Thekkady plantations at ₹32,500 per person.",
          },
        ],
        replyDraft:
          "Dear Sneha & Rohan,\n\nGreetings from Aroha Travels! January offers the crispest, sunniest weather across Munnar's high elevation tea estates.\n\nOur 6-day 'Munnar, Thekkady and Alleppey Houseboat' journey is available at ₹32,500 per person (total ₹65,000 for the couple), aligning smoothly within your ₹70,000 target budget.\n\nWarm regards,\nAroha Travels Team",
        approved: false,
        provider: "gemini-1.5-flash",
      },
      notes: [],
    },
    {
      enquiryNumber: "ENQ-2026-007",
      customerName: "Karthik Iyer",
      email: "karthik.iyer@example.com",
      phone: "+91 94440 11223",
      destination: "Rameswaram & Kanyakumari",
      travelStartDate: new Date("2026-11-05T00:00:00Z"),
      travelEndDate: new Date("2026-11-09T00:00:00Z"),
      duration: "5 days",
      adults: 2,
      children: 0,
      budget: 40000,
      specialRequirements: "Pure vegetarian South Indian food places recommendations, early morning temple darshan.",
      originalMessage: "Need 5 day trip covering Rameswaram, Dhanushkodi and Kanyakumari. 2 adults, November first week. Budget 40-45k. Pure satvik veg meals preferred.",
      preferredContactMethod: "EMAIL",
      whatsappConsent: false,
      status: EnquiryStatus.LOST,
      priority: "LOW",
      assignedTo: "Aroha Operations Admin",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
      aiExtraction: {
        extractedData: {
          destination: "Rameswaram & Kanyakumari",
          adults: 2,
          children: 0,
          duration: "5 days",
          travel_month: "November",
          budget: 45000,
          special_requirements: ["Satvik vegetarian food", "Dhanushkodi", "Temple darshan"],
          confidence: 0.94,
        },
        confidence: 0.94,
        recommendations: [
          {
            packageId: pkg2.id,
            packageCode: pkg2.packageCode,
            title: pkg2.title,
            matchScore: 0.95,
            seasonMatched: "All-Year Standard Price",
            pricePerPerson: 18750,
            estimatedTotal: 37500,
            reason: "Covers Rameswaram, Dhanushkodi, and Kanyakumari at ₹18,750 per person (₹37,500 total).",
          },
        ],
        replyDraft:
          "Dear Mr. Karthik Iyer,\n\nGreetings from Aroha Travels. Our 5-day South India pilgrimage package perfectly aligns with your dates and budget at ₹18,750 per person on twin-sharing basis.\n\nWarm regards,\nAroha Travels",
        approved: false,
        provider: "rule-based-fallback",
      },
      notes: [
        {
          authorName: "Aroha Operations Admin",
          note: "Customer decided to travel by family private car directly from Chennai. Marked as Lost.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
        },
      ],
    },
    {
      enquiryNumber: "ENQ-2026-008",
      customerName: "Meera Krishnan",
      email: "meera.k@example.com",
      phone: "+91 98450 33445",
      destination: "Alleppey & Kumarakom",
      travelStartDate: new Date("2026-08-18T00:00:00Z"),
      travelEndDate: new Date("2026-08-24T00:00:00Z"),
      duration: "6 days",
      adults: 2,
      children: 1,
      budget: 85000,
      specialRequirements: "Authentic Ayurvedic massage treatments, peaceful lakefront retreat, village canoe tours.",
      originalMessage: "Hello, looking for a 6 day monsoon wellness break in Alleppey backwaters in August. Want traditional Ayurvedic treatments and 1 night on a houseboat. 2 adults and 1 teenager.",
      preferredContactMethod: "EMAIL",
      whatsappConsent: true,
      status: EnquiryStatus.NEW,
      priority: "MEDIUM",
      assignedTo: "Kavya Menon",
      createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
      aiExtraction: {
        extractedData: {
          destination: "Alleppey & Backwaters",
          adults: 2,
          children: 1,
          duration: "6 days",
          travel_month: "August",
          budget: 85000,
          special_requirements: ["Ayurvedic treatments", "Monsoon wellness", "Houseboat 1 night"],
          confidence: 0.95,
        },
        confidence: 0.95,
        recommendations: [
          {
            packageId: pkg1.id,
            packageCode: pkg1.packageCode,
            title: pkg1.title,
            matchScore: 0.92,
            seasonMatched: "Monsoon Season (Ayurveda & Emerald Greenery)",
            pricePerPerson: 24900,
            estimatedTotal: 62250,
            reason: "Monsoon promotional rate of ₹24,900 per person includes spa facilities and private houseboat cruise.",
          },
        ],
        replyDraft:
          "Dear Meera,\n\nAugust is traditionally regarded as the most effective season for Ayurvedic wellness in Kerala, when the atmosphere is cool and the pores absorb herbal medicated oils most effectively.\n\nOur 6-day package is offered at our Monsoon special rate of ₹24,900 per person on twin-sharing basis (approx ₹62,250 + GST for your family). It includes 4-star lake and forest resorts with certified Ayurvedic Vaidyas, followed by a serene private houseboat cruise.\n\nWarm regards,\nKavya Menon\nAroha Travels",
        approved: false,
        provider: "gemini-1.5-flash",
      },
      notes: [],
    },
  ];

  for (const enq of sampleEnquiries) {
    const { aiExtraction, notes, ...enquiryData } = enq;
    const createdEnq = await prisma.enquiry.create({
      data: enquiryData,
    });

    if (aiExtraction) {
      await prisma.aIExtraction.create({
        data: {
          enquiryId: createdEnq.id,
          ...aiExtraction,
        },
      });
    }

    if (notes && notes.length > 0) {
      for (const n of notes) {
        await prisma.enquiryNote.create({
          data: {
            enquiryId: createdEnq.id,
            userId: adminUser.id,
            authorName: n.authorName,
            note: n.note,
            createdAt: n.createdAt,
          },
        });
      }
    }
  }

  // 8. Add realistic Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: adminUser.id,
        userName: adminUser.name,
        action: "PACKAGE_PUBLISHED",
        entityType: "PACKAGE",
        entityId: pkg1.id,
        details: "Published Munnar, Thekkady and Alleppey Houseboat with peak & monsoon pricing.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120),
      },
      {
        userId: consultantUser.id,
        userName: consultantUser.name,
        action: "ENQUIRY_STATUS_UPDATED",
        entityType: "ENQUIRY",
        entityId: "ENQ-2026-002",
        details: "Updated Priya Nair enquiry status from NEW to CONTACTED after phone call.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        userId: adminUser.id,
        userName: adminUser.name,
        action: "BOOKING_CONVERTED",
        entityType: "ENQUIRY",
        entityId: "ENQ-2026-005",
        details: "Vikram Malhotra Christmas booking converted. Advance deposit received.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      },
      {
        userId: consultantUser.id,
        userName: consultantUser.name,
        action: "AI_EXTRACTION_REVIEWED",
        entityType: "ENQUIRY",
        entityId: "ENQ-2026-004",
        details: "Approved AI draft reply for Ananya Deshmukh with solo monsoon pricing.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ],
  });

  console.log("✅ Seed finished successfully! 4 packages, 8 enquiries, and realistic activity logs created.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

