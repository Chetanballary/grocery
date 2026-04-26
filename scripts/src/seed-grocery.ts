import {
  db,
  categoriesTable,
  productsTable,
  type InsertProduct,
} from "@workspace/db";

type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  unit: string;
  price: number;
  mrp: number;
  stock: number;
  featured?: boolean;
  rating?: number;
  ratingCount?: number;
};

const categories = [
  {
    slug: "fruits",
    name: "Fresh Fruits",
    description:
      "Hand-picked seasonal fruits delivered fresh from the farm to your doorstep.",
    imageUrl:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=80",
    accentColor: "#F97316",
    sortOrder: 1,
    products: [
      {
        slug: "kashmiri-apples-1kg",
        name: "Kashmiri Apples",
        description:
          "Crisp, juicy red Kashmiri apples bursting with sweetness. Perfect for snacking or salads.",
        imageUrl:
          "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=800&q=80",
        unit: "1 kg",
        price: 189,
        mrp: 240,
        stock: 60,
        featured: true,
        rating: 4.6,
        ratingCount: 248,
      },
      {
        slug: "alphonso-mangoes-12pc",
        name: "Alphonso Mangoes",
        description:
          "The king of mangoes from Ratnagiri — fragrant, fiber-free pulp with rich golden flesh.",
        imageUrl:
          "https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&w=800&q=80",
        unit: "12 pc box",
        price: 899,
        mrp: 1200,
        stock: 25,
        featured: true,
        rating: 4.8,
        ratingCount: 412,
      },
      {
        slug: "bananas-robusta-dozen",
        name: "Robusta Bananas",
        description:
          "Naturally ripened robusta bananas — soft, sweet, and full of energy.",
        imageUrl:
          "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
        unit: "12 pc",
        price: 59,
        mrp: 70,
        stock: 120,
        rating: 4.4,
        ratingCount: 187,
      },
      {
        slug: "pomegranate-1kg",
        name: "Pomegranate",
        description:
          "Plump, ruby-red pomegranates packed with antioxidants and natural sweetness.",
        imageUrl:
          "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&w=800&q=80",
        unit: "1 kg",
        price: 149,
        mrp: 199,
        stock: 80,
        rating: 4.5,
        ratingCount: 156,
      },
      {
        slug: "green-grapes-500g",
        name: "Green Grapes",
        description:
          "Seedless green grapes — crunchy, refreshing, and lunch-box friendly.",
        imageUrl:
          "https://images.unsplash.com/photo-1599819177626-b32a4c0d3a13?auto=format&fit=crop&w=800&q=80",
        unit: "500 g",
        price: 79,
        mrp: 95,
        stock: 90,
        rating: 4.3,
        ratingCount: 96,
      },
      {
        slug: "sweet-lime-1kg",
        name: "Sweet Lime (Mosambi)",
        description:
          "Juicy mosambi perfect for fresh juice — naturally sweet and refreshing.",
        imageUrl:
          "https://images.unsplash.com/photo-1556909114-8f1a26f7c5e2?auto=format&fit=crop&w=800&q=80",
        unit: "1 kg",
        price: 69,
        mrp: 90,
        stock: 100,
        rating: 4.2,
        ratingCount: 78,
      },
      {
        slug: "papaya-1pc",
        name: "Ripe Papaya",
        description:
          "Sun-ripened papaya — sweet, soft, and great for breakfast bowls.",
        imageUrl:
          "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?auto=format&fit=crop&w=800&q=80",
        unit: "approx 1 kg",
        price: 49,
        mrp: 65,
        stock: 70,
        rating: 4.1,
        ratingCount: 64,
      },
      {
        slug: "watermelon-1pc",
        name: "Watermelon",
        description:
          "Big, juicy watermelon — the ultimate summer cooler for the whole family.",
        imageUrl:
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
        unit: "approx 3 kg",
        price: 99,
        mrp: 120,
        stock: 40,
        featured: true,
        rating: 4.4,
        ratingCount: 132,
      },
    ],
  },
  {
    slug: "vegetables",
    name: "Fresh Vegetables",
    description:
      "Farm-fresh vegetables sourced daily from local farmers — washed and ready to cook.",
    imageUrl:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80",
    accentColor: "#22C55E",
    sortOrder: 2,
    products: [
      {
        slug: "tomatoes-1kg",
        name: "Hybrid Tomatoes",
        description:
          "Plump, red hybrid tomatoes — perfect for daily curries, salads, and sauces.",
        imageUrl:
          "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
        unit: "1 kg",
        price: 39,
        mrp: 55,
        stock: 200,
        featured: true,
        rating: 4.3,
        ratingCount: 312,
      },
      {
        slug: "onions-1kg",
        name: "Nashik Onions",
        description:
          "Premium Nashik onions — pungent, firm, and the heart of every Indian kitchen.",
        imageUrl:
          "https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?auto=format&fit=crop&w=800&q=80",
        unit: "1 kg",
        price: 35,
        mrp: 50,
        stock: 250,
        rating: 4.4,
        ratingCount: 401,
      },
      {
        slug: "potatoes-1kg",
        name: "Fresh Potatoes",
        description:
          "Versatile fresh potatoes — handpicked for everyday cooking.",
        imageUrl:
          "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80",
        unit: "1 kg",
        price: 32,
        mrp: 42,
        stock: 300,
        rating: 4.5,
        ratingCount: 510,
      },
      {
        slug: "spinach-bunch",
        name: "Palak (Spinach)",
        description:
          "Tender baby spinach leaves — full of iron and ready to wash and cook.",
        imageUrl:
          "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80",
        unit: "1 bunch",
        price: 25,
        mrp: 35,
        stock: 150,
        rating: 4.2,
        ratingCount: 88,
      },
      {
        slug: "ladies-finger-500g",
        name: "Ladies Finger (Bhindi)",
        description:
          "Tender, crisp bhindi — perfect for sabzi or stir-fry.",
        imageUrl:
          "https://images.unsplash.com/photo-1664813391127-e6f2f4d68e9e?auto=format&fit=crop&w=800&q=80",
        unit: "500 g",
        price: 29,
        mrp: 40,
        stock: 130,
        rating: 4.3,
        ratingCount: 71,
      },
      {
        slug: "capsicum-500g",
        name: "Green Capsicum",
        description:
          "Crunchy, glossy green capsicum — adds color and flavor to any meal.",
        imageUrl:
          "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=80",
        unit: "500 g",
        price: 45,
        mrp: 60,
        stock: 110,
        rating: 4.4,
        ratingCount: 92,
      },
      {
        slug: "carrots-1kg",
        name: "Ooty Carrots",
        description:
          "Bright orange Ooty carrots — sweet, crunchy, and great for salads or juice.",
        imageUrl:
          "https://images.unsplash.com/photo-1582515073490-39981397c445?auto=format&fit=crop&w=800&q=80",
        unit: "1 kg",
        price: 49,
        mrp: 65,
        stock: 140,
        featured: true,
        rating: 4.5,
        ratingCount: 178,
      },
      {
        slug: "cauliflower-1pc",
        name: "Cauliflower (Phool Gobi)",
        description:
          "Fresh, tightly packed cauliflower — washed and trimmed for your kitchen.",
        imageUrl:
          "https://images.unsplash.com/photo-1568584711271-6c929fb49b60?auto=format&fit=crop&w=800&q=80",
        unit: "1 pc",
        price: 39,
        mrp: 55,
        stock: 100,
        rating: 4.2,
        ratingCount: 65,
      },
      {
        slug: "ginger-250g",
        name: "Fresh Ginger",
        description:
          "Aromatic fresh ginger root — essential for chai, curries, and home remedies.",
        imageUrl:
          "https://images.unsplash.com/photo-1606914469633-da7b2ca5cf6f?auto=format&fit=crop&w=800&q=80",
        unit: "250 g",
        price: 35,
        mrp: 50,
        stock: 180,
        rating: 4.6,
        ratingCount: 224,
      },
      {
        slug: "garlic-250g",
        name: "Garlic",
        description:
          "Fragrant garlic bulbs — full-flavored cloves for tadka and marinades.",
        imageUrl:
          "https://images.unsplash.com/photo-1615477550927-6ec8445fcfd4?auto=format&fit=crop&w=800&q=80",
        unit: "250 g",
        price: 49,
        mrp: 70,
        stock: 160,
        rating: 4.5,
        ratingCount: 198,
      },
    ],
  },
  {
    slug: "dairy-bread",
    name: "Dairy & Bread",
    description:
      "Fresh milk, paneer, curd, eggs and bakery breads — your daily breakfast essentials.",
    imageUrl:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
    accentColor: "#3B82F6",
    sortOrder: 3,
    products: [
      {
        slug: "amul-toned-milk-1l",
        name: "Amul Toned Milk",
        description:
          "Amul Taaza toned milk — rich, fresh, and pasteurized for safety.",
        imageUrl:
          "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80",
        unit: "1 L pouch",
        price: 64,
        mrp: 68,
        stock: 250,
        featured: true,
        rating: 4.7,
        ratingCount: 824,
      },
      {
        slug: "paneer-200g",
        name: "Fresh Paneer",
        description:
          "Soft, fresh cottage cheese — perfect for paneer butter masala or wraps.",
        imageUrl:
          "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
        unit: "200 g",
        price: 89,
        mrp: 110,
        stock: 80,
        rating: 4.6,
        ratingCount: 256,
      },
      {
        slug: "curd-400g",
        name: "Fresh Curd (Dahi)",
        description:
          "Thick, creamy homemade-style curd — great with parathas or as raita.",
        imageUrl:
          "https://images.unsplash.com/photo-1624811119095-86755b2dca7d?auto=format&fit=crop&w=800&q=80",
        unit: "400 g cup",
        price: 45,
        mrp: 55,
        stock: 140,
        rating: 4.4,
        ratingCount: 188,
      },
      {
        slug: "amul-butter-500g",
        name: "Amul Butter",
        description:
          "The classic Utterly Butterly delicious yellow butter — salted, table grade.",
        imageUrl:
          "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80",
        unit: "500 g",
        price: 285,
        mrp: 305,
        stock: 60,
        rating: 4.8,
        ratingCount: 612,
      },
      {
        slug: "brown-bread-400g",
        name: "Whole Wheat Brown Bread",
        description:
          "Soft, fiber-rich brown bread — bakery fresh, no maida.",
        imageUrl:
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
        unit: "400 g loaf",
        price: 49,
        mrp: 60,
        stock: 90,
        featured: true,
        rating: 4.3,
        ratingCount: 142,
      },
      {
        slug: "white-bread-400g",
        name: "Soft White Sandwich Bread",
        description:
          "Pillowy soft white bread — perfect for sandwiches and toast.",
        imageUrl:
          "https://images.unsplash.com/photo-1568471173242-461f0a730452?auto=format&fit=crop&w=800&q=80",
        unit: "400 g loaf",
        price: 45,
        mrp: 55,
        stock: 100,
        rating: 4.2,
        ratingCount: 110,
      },
      {
        slug: "eggs-tray-of-30",
        name: "Farm Fresh Eggs",
        description:
          "Tray of 30 farm-fresh eggs — protein-rich and great for everyday cooking.",
        imageUrl:
          "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?auto=format&fit=crop&w=800&q=80",
        unit: "30 eggs",
        price: 219,
        mrp: 260,
        stock: 70,
        rating: 4.6,
        ratingCount: 342,
      },
      {
        slug: "cheese-slices-200g",
        name: "Cheese Slices",
        description:
          "Mild, melty processed cheese slices — sandwich and burger ready.",
        imageUrl:
          "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80",
        unit: "10 slices, 200 g",
        price: 145,
        mrp: 170,
        stock: 80,
        rating: 4.4,
        ratingCount: 96,
      },
    ],
  },
  {
    slug: "personal-daily",
    name: "Personal Daily Essentials",
    description:
      "Daily personal care must-haves — soaps, shampoos, oral care and more.",
    imageUrl:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
    accentColor: "#A855F7",
    sortOrder: 4,
    products: [
      {
        slug: "colgate-toothpaste-200g",
        name: "Colgate Strong Teeth Toothpaste",
        description:
          "Calcium-enriched toothpaste for strong teeth and fresh breath.",
        imageUrl:
          "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80",
        unit: "200 g",
        price: 119,
        mrp: 145,
        stock: 150,
        featured: true,
        rating: 4.6,
        ratingCount: 421,
      },
      {
        slug: "dove-soap-bar-100g",
        name: "Dove Cream Bathing Bar",
        description:
          "Moisturizing cream bar with 1/4 moisturizing cream — gentle on skin.",
        imageUrl:
          "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80",
        unit: "100 g",
        price: 75,
        mrp: 90,
        stock: 200,
        rating: 4.5,
        ratingCount: 312,
      },
      {
        slug: "head-shoulders-shampoo-340ml",
        name: "Head & Shoulders Anti-Dandruff Shampoo",
        description:
          "Cool menthol shampoo for dandruff-free, refreshed hair.",
        imageUrl:
          "https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?auto=format&fit=crop&w=800&q=80",
        unit: "340 ml",
        price: 365,
        mrp: 425,
        stock: 80,
        rating: 4.4,
        ratingCount: 188,
      },
      {
        slug: "nivea-body-lotion-400ml",
        name: "Nivea Soft Body Lotion",
        description:
          "Light, non-greasy moisturizer with jojoba oil and Vitamin E.",
        imageUrl:
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
        unit: "400 ml",
        price: 379,
        mrp: 450,
        stock: 60,
        rating: 4.5,
        ratingCount: 142,
      },
      {
        slug: "gillette-mach3-razor",
        name: "Gillette Mach3 Razor",
        description:
          "Three-blade smooth shave razor — comfortable everyday grooming.",
        imageUrl:
          "https://images.unsplash.com/photo-1626128665085-483747621778?auto=format&fit=crop&w=800&q=80",
        unit: "1 razor",
        price: 245,
        mrp: 295,
        stock: 70,
        rating: 4.5,
        ratingCount: 98,
      },
      {
        slug: "whisper-ultra-pads-30",
        name: "Whisper Ultra Soft Pads",
        description:
          "Soft, dry-feel sanitary pads with wings — XL size, pack of 30.",
        imageUrl:
          "https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=800&q=80",
        unit: "30 pads",
        price: 395,
        mrp: 460,
        stock: 90,
        rating: 4.7,
        ratingCount: 256,
      },
      {
        slug: "dettol-handwash-200ml",
        name: "Dettol Original Handwash",
        description:
          "Germ-protection liquid handwash with refreshing fragrance.",
        imageUrl:
          "https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=800&q=80",
        unit: "200 ml",
        price: 99,
        mrp: 130,
        stock: 150,
        featured: true,
        rating: 4.6,
        ratingCount: 312,
      },
      {
        slug: "parachute-coconut-oil-500ml",
        name: "Parachute Coconut Oil",
        description:
          "Pure coconut oil for hair and skin — naturally nourishing.",
        imageUrl:
          "https://images.unsplash.com/photo-1556228724-2a85eb6e2f01?auto=format&fit=crop&w=800&q=80",
        unit: "500 ml",
        price: 219,
        mrp: 260,
        stock: 110,
        rating: 4.7,
        ratingCount: 421,
      },
    ],
  },
  {
    slug: "home-utilities",
    name: "Home Utilities",
    description:
      "Cleaning, laundry, kitchen and household essentials — keep your home spotless.",
    imageUrl:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
    accentColor: "#EAB308",
    sortOrder: 5,
    products: [
      {
        slug: "surf-excel-easywash-2kg",
        name: "Surf Excel Easy Wash Detergent",
        description:
          "Tough on stains, gentle on clothes — 2 kg pack of detergent powder.",
        imageUrl:
          "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80",
        unit: "2 kg",
        price: 399,
        mrp: 480,
        stock: 80,
        featured: true,
        rating: 4.5,
        ratingCount: 312,
      },
      {
        slug: "vim-dishwash-bar-300g",
        name: "Vim Dishwash Bar",
        description:
          "The classic 100 lemons in 1 dishwash bar — fast grease removal.",
        imageUrl:
          "https://images.unsplash.com/photo-1583947581924-a6a2cb6db1aa?auto=format&fit=crop&w=800&q=80",
        unit: "300 g",
        price: 49,
        mrp: 60,
        stock: 200,
        rating: 4.6,
        ratingCount: 410,
      },
      {
        slug: "harpic-toilet-cleaner-1l",
        name: "Harpic Power Plus Toilet Cleaner",
        description:
          "Thick disinfectant gel that kills 99.9% of germs in toilet bowls.",
        imageUrl:
          "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80",
        unit: "1 L",
        price: 199,
        mrp: 245,
        stock: 100,
        rating: 4.5,
        ratingCount: 198,
      },
      {
        slug: "lizol-floor-cleaner-1l",
        name: "Lizol Disinfectant Floor Cleaner",
        description:
          "Citrus floor cleaner — 10x better cleaning, kills germs.",
        imageUrl:
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
        unit: "1 L",
        price: 215,
        mrp: 260,
        stock: 90,
        rating: 4.6,
        ratingCount: 246,
      },
      {
        slug: "garbage-bags-30-medium",
        name: "Disposable Garbage Bags",
        description:
          "Pack of 30 medium-size oxo-biodegradable garbage bags with tie strings.",
        imageUrl:
          "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=800&q=80",
        unit: "30 bags, medium",
        price: 159,
        mrp: 199,
        stock: 110,
        rating: 4.4,
        ratingCount: 156,
      },
      {
        slug: "good-knight-mosquito-machine",
        name: "Good Knight Mosquito Repellent Machine",
        description:
          "Activ+ mosquito repellent machine with refill — protects all night.",
        imageUrl:
          "https://images.unsplash.com/photo-1609205264511-b1d4d4d6b8b1?auto=format&fit=crop&w=800&q=80",
        unit: "1 machine + refill",
        price: 109,
        mrp: 135,
        stock: 100,
        rating: 4.4,
        ratingCount: 188,
      },
      {
        slug: "scotch-brite-scrub-pack",
        name: "Scotch-Brite Scrub Pad",
        description:
          "Tough scrub pads for utensils — pack of 3, deep cleans without scratches.",
        imageUrl:
          "https://images.unsplash.com/photo-1581598810335-5f9d7c024d80?auto=format&fit=crop&w=800&q=80",
        unit: "Pack of 3",
        price: 65,
        mrp: 85,
        stock: 180,
        rating: 4.5,
        ratingCount: 220,
      },
      {
        slug: "tata-salt-1kg",
        name: "Tata Salt",
        description:
          "Iodized table salt — the trusted everyday kitchen essential.",
        imageUrl:
          "https://images.unsplash.com/photo-1518110925495-b37653b46916?auto=format&fit=crop&w=800&q=80",
        unit: "1 kg",
        price: 28,
        mrp: 32,
        stock: 300,
        rating: 4.7,
        ratingCount: 612,
      },
    ],
  },
  {
    slug: "puja-items",
    name: "Puja Items",
    description:
      "Sacred essentials for daily worship — agarbatti, diyas, camphor and pure ingredients.",
    imageUrl:
      "https://images.unsplash.com/photo-1605369572399-05d8d64a0f5e?auto=format&fit=crop&w=900&q=80",
    accentColor: "#DC2626",
    sortOrder: 6,
    products: [
      {
        slug: "cycle-three-in-one-agarbatti",
        name: "Cycle Three in One Agarbatti",
        description:
          "Iconic blend of mogra, lavender and rose — long-lasting fragrance for daily puja.",
        imageUrl:
          "https://images.unsplash.com/photo-1614812513172-567d2fe96a75?auto=format&fit=crop&w=800&q=80",
        unit: "120 sticks",
        price: 99,
        mrp: 130,
        stock: 150,
        featured: true,
        rating: 4.7,
        ratingCount: 412,
      },
      {
        slug: "mangaldeep-sambrani-cups",
        name: "Mangaldeep Sambrani Cups",
        description:
          "Traditional sambrani dhoop cups — pack of 12, instant temple-like aroma.",
        imageUrl:
          "https://images.unsplash.com/photo-1599981854834-7df4f55cdb45?auto=format&fit=crop&w=800&q=80",
        unit: "12 cups",
        price: 79,
        mrp: 100,
        stock: 130,
        rating: 4.6,
        ratingCount: 234,
      },
      {
        slug: "camphor-tablets-100g",
        name: "Pure Camphor (Kapur)",
        description:
          "Refined pure camphor tablets — for aarti, puja and air purification.",
        imageUrl:
          "https://images.unsplash.com/photo-1600357077400-7a6d6cb7e1a4?auto=format&fit=crop&w=800&q=80",
        unit: "100 g",
        price: 145,
        mrp: 180,
        stock: 90,
        rating: 4.7,
        ratingCount: 312,
      },
      {
        slug: "ghee-diyas-pack-of-12",
        name: "Pure Ghee Diyas",
        description:
          "Ready-to-light pure ghee diyas — pack of 12, burns 4+ hours each.",
        imageUrl:
          "https://images.unsplash.com/photo-1572979643767-2dabb8aef1b8?auto=format&fit=crop&w=800&q=80",
        unit: "12 diyas",
        price: 199,
        mrp: 260,
        stock: 80,
        featured: true,
        rating: 4.8,
        ratingCount: 256,
      },
      {
        slug: "haldi-kumkum-set",
        name: "Haldi Kumkum Set",
        description:
          "Traditional haldi (turmeric) and kumkum set in a small brass-look box.",
        imageUrl:
          "https://images.unsplash.com/photo-1604335079441-1b9c1f3a3a07?auto=format&fit=crop&w=800&q=80",
        unit: "50 g each",
        price: 119,
        mrp: 150,
        stock: 100,
        rating: 4.5,
        ratingCount: 142,
      },
      {
        slug: "cotton-wicks-pack",
        name: "Cotton Wicks (Batti)",
        description:
          "Soft, long cotton wicks — 100% cotton, ideal for ghee or oil diyas.",
        imageUrl:
          "https://images.unsplash.com/photo-1604335079441-1b9c1f3a3a07?auto=format&fit=crop&w=800&q=80",
        unit: "Pack of 100",
        price: 49,
        mrp: 65,
        stock: 200,
        rating: 4.6,
        ratingCount: 188,
      },
      {
        slug: "puja-thali-brass-look",
        name: "Brass-Look Puja Thali",
        description:
          "Elegant brass-look puja thali with diya, bell and incense holder.",
        imageUrl:
          "https://images.unsplash.com/photo-1605369572399-05d8d64a0f5e?auto=format&fit=crop&w=800&q=80",
        unit: "1 set",
        price: 449,
        mrp: 599,
        stock: 40,
        rating: 4.5,
        ratingCount: 96,
      },
      {
        slug: "gangajal-bottle-500ml",
        name: "Gangajal (Holy Water)",
        description:
          "Authentic Gangajal sourced from Haridwar — sealed for purity.",
        imageUrl:
          "https://images.unsplash.com/photo-1599981854834-7df4f55cdb45?auto=format&fit=crop&w=800&q=80",
        unit: "500 ml",
        price: 75,
        mrp: 99,
        stock: 110,
        rating: 4.7,
        ratingCount: 312,
      },
    ],
  },
] satisfies Array<{
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  accentColor: string;
  sortOrder: number;
  products: SeedProduct[];
}>;

async function main() {
  console.log("Seeding categories and products...");

  for (const cat of categories) {
    const existing = await db.query.categoriesTable.findFirst({
      where: (c, { eq }) => eq(c.slug, cat.slug),
    });
    let categoryId: number;
    if (existing) {
      categoryId = existing.id;
      console.log(`Category exists: ${cat.name} (id=${categoryId})`);
    } else {
      const inserted = await db
        .insert(categoriesTable)
        .values({
          slug: cat.slug,
          name: cat.name,
          description: cat.description,
          imageUrl: cat.imageUrl,
          accentColor: cat.accentColor,
          sortOrder: cat.sortOrder,
        })
        .returning();
      categoryId = inserted[0].id;
      console.log(`Inserted category: ${cat.name} (id=${categoryId})`);
    }

    for (const prod of cat.products) {
      const existsP = await db.query.productsTable.findFirst({
        where: (p, { eq }) => eq(p.slug, prod.slug),
      });
      if (existsP) continue;
      const insertVal: InsertProduct = {
        slug: prod.slug,
        name: prod.name,
        description: prod.description,
        imageUrl: prod.imageUrl,
        unit: prod.unit,
        price: prod.price.toFixed(2),
        mrp: prod.mrp.toFixed(2),
        stock: prod.stock,
        featured: prod.featured ?? false,
        rating: (prod.rating ?? 4.5).toFixed(2),
        ratingCount: prod.ratingCount ?? 0,
        categoryId,
      };
      await db.insert(productsTable).values(insertVal);
    }
    console.log(`Seeded ${cat.products.length} products for ${cat.name}`);
  }

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
