import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check route (for testing)
app.get("/", (req, res) => {
  res.send("Backend working");
});

app.post("/generate", async (req, res) => {
  try {
    // 🔒 Basic validation
    if (!req.body || !req.body.messages) {
      return res.status(400).json({
        error: "Invalid request format. 'messages' field is required."
      });
    }

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();

    // 🔒 Validate AI response
    if (!data.choices) {
      return res.status(400).json({
        error: "Invalid response from AI provider",
        details: data
      });
    }

    res.json(data);

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({
      error: "Internal Server Error"
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
