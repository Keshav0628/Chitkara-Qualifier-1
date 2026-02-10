require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ================= HEALTH API =================
app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: process.env.OFFICIAL_EMAIL
  });
});

// ================= HELPER FUNCTIONS =================
const isPrime = (n) => {
  if (n <= 1) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

// ================= BFHL API =================
app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const key = Object.keys(body)[0];

    if (!key) {
      return res.status(400).json({
        is_success: false,
        official_email: process.env.OFFICIAL_EMAIL
      });
    }

    let data;

    // FIBONACCI
    if (key === "fibonacci") {
      const n = body.fibonacci;
      if (typeof n !== "number" || n < 0) throw "Invalid input";

      let fib = [0, 1];
      for (let i = 2; i < n; i++) {
        fib.push(fib[i - 1] + fib[i - 2]);
      }
      data = fib.slice(0, n);
    }

    // PRIME
    else if (key === "prime") {
      data = body.prime.filter(isPrime);
    }

    // LCM
    else if (key === "lcm") {
      data = body.lcm.reduce((a, b) => lcm(a, b));
    }

    // HCF
    else if (key === "hcf") {
      data = body.hcf.reduce((a, b) => gcd(a, b));
    }

    // AI
    else if (key === "AI") {
      const question = body.AI;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: question }] }]
        }
      );

      data =
        response.data.candidates[0].content.parts[0].text
          .split(" ")[0]
          .replace(/[^a-zA-Z]/g, "");
    }

    else {
      throw "Invalid key";
    }

    res.status(200).json({
      is_success: true,
      official_email: process.env.OFFICIAL_EMAIL,
      data
    });

  } catch (err) {
    res.status(400).json({
      is_success: false,
      official_email: process.env.OFFICIAL_EMAIL
    });
  }
});

// ================= START SERVER =================
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
