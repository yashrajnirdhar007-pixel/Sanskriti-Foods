import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

const products = [
    {
      id: "p_metkut",
      name: "Sanskriti Foods Metkut",
      description: "Traditional Maharashtrian-style Metkut prepared using a blend of grains, pulses and selected spices. A flavorful and nutritious traditional food that can be enjoyed as part of everyday meals.",
      price: 180,
      image: "https://images.unsplash.com/photo-1605341517409-72c67c51ddf9?w=600&auto=format&fit=crop&q=60",
      category: "Traditional Foods",
      variants: ["250g", "500g"],
      stock: 100,
      rating: 4.9,
      reviews: 145,
      ingredients: "Chana Dal, Urad Dal, Rice, Wheat, Coriander Seeds, Cumin, Mustard, Turmeric, Dry Ginger",
      taste: "Mild & Earthy",
      shelfLife: "6 Months",
      storage: "Store in a cool, dry place. Keep airtight.",
      bestWith: "Hot Rice, Ghee, Curd"
    },
    {
      id: "p_jeerapapad",
      name: "Sanskriti Foods Jeera Rice Papad",
      description: "Traditional handmade rice papad prepared with cumin for an authentic homemade taste. Perfect for roasting or frying and serving with everyday Indian meals.",
      price: 120,
      image: "https://images.unsplash.com/photo-1596450514735-111a2fe02935?w=600&auto=format&fit=crop&q=60",
      category: "Papad",
      variants: ["200g", "500g"],
      stock: 80,
      rating: 4.8,
      reviews: 210,
      ingredients: "Rice Flour, Cumin Seeds (Jeera), Salt, Papad Khar, Oil",
      taste: "Savory & Crispy",
      shelfLife: "12 Months",
      storage: "Keep in a dry place. Sun-dry occasionally.",
      bestWith: "Dal-Rice, Khichdi, Tea"
    }
];

async function seed() {
  try {
    await signInWithEmailAndPassword(auth, 'nirdhar007@gamilcom', 'raya007');
    console.log("Logged in!");
    for (const p of products) {
      await setDoc(doc(db, 'products', p.id), p);
      console.log(`Added ${p.name}`);
    }
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}

seed();
