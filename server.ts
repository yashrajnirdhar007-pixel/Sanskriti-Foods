import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ override: true });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock database
  const products = [
    {
      id: "p_metkut",
      name: "Metkut",
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
      name: "Jeera Rice Papad",
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

  // API Routes
  app.get("/api/products", (req, res) => {
    res.json(products);
  });

  app.get("/api/products/:id", (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  });

  // Razorpay API Routes
  app.post("/api/create-order", async (req, res) => {
    try {
      const { amount } = req.body;
      const key_id = process.env.RAZORPAY_KEY_ID;
      const key_secret = process.env.RAZORPAY_KEY_SECRET;

      if (!key_id || !key_secret) {
        console.error("Razorpay Key ID or Secret is missing from environment variables.");
        return res.status(500).json({ success: false, message: "Server misconfiguration" });
      }

      console.log("Razorpay Key ID configured: true (Length: " + key_id.length + ")");
      console.log("Razorpay Key Secret configured: true (Length: " + key_secret.length + ")");
      if (key_id.trim() !== key_id || key_secret.trim() !== key_secret) {
        console.warn("WARNING: Razorpay keys contain leading or trailing whitespace!");
      }
      if (key_secret.includes("*")) {
        console.error("ERROR: Razorpay Key Secret contains asterisks. It looks like a masked string was copied.");
        return res.status(500).json({ success: false, message: "Invalid Razorpay Secret", error: "Your secret contains asterisks (*). You copied the masked secret from the Razorpay dashboard instead of the real one." });
      }
      console.log("Razorpay order creation started");

      const instance = new Razorpay({ key_id: key_id.trim(), key_secret: key_secret.trim() });

      const options = {
        amount: amount * 100, // amount in smallest currency unit (paise)
        currency: "INR",
        receipt: `receipt_${Date.now()}`
      };

      const order = await instance.orders.create(options);
      console.log("Razorpay order created successfully");
      res.json({ success: true, order, key_id });
    } catch (error: any) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ success: false, message: "Invalid Razorpay Keys Provided", error: error?.error?.description || "Server error" });
    }
  });

  app.post("/api/verify-payment", (req, res) => {
    try {
      console.log("Payment verification started");
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const secret = process.env.RAZORPAY_KEY_SECRET;

      if (!secret) {
        return res.status(500).json({ success: false, message: "Server misconfiguration: missing secret" });
      }

      const shasum = crypto.createHmac("sha256", secret.trim());
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest("hex");

      if (digest === razorpay_signature) {
        console.log("Payment verification successful");
        res.json({ success: true, message: "Payment verified successfully" });
      } else {
        console.warn("Payment verification failed: Invalid signature");
        res.status(400).json({ success: false, message: "Invalid signature" });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ success: false, message: "Verification error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
