
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.TWELVE_DATA_API_KEY;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Saiful Live Signal"
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

app.get("/api/market", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({
        error: "API key not configured"
      });
    }

    const symbol = req.query.symbol || "EUR/USD";

    if (!/^[A-Za-z0-9/_.:-]{3,30}$/.test(symbol)) {
      return res.status(400).json({
        error: "Invalid symbol"
      });
    }

    const url = new URL(
      "https://api.twelvedata.com/time_series"
    );

    url.searchParams.set("symbol", symbol);
    url.searchParams.set("interval", "1min");
    url.searchParams.set("outputsize", "30");
    url.searchParams.set("apikey", API_KEY);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.values) {
      return res.status(502).json({
        error: data.message || "Market data unavailable"
      });
    }

    res.json({
      status: "success",
      symbol,
      candles: data.values,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log("Saiful Live Signal running on port " + PORT);
});
