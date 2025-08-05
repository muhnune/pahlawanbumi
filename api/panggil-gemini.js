export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Method not allowed. Only POST requests are accepted." });
  }

  try {
    // Get prompt from request body
    const { prompt } = req.body;

    if (!prompt) {
      return res
        .status(400)
        .json({ error: "Prompt is required in request body." });
    }

    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment variables");
      return res
        .status(500)
        .json({ error: "Server configuration error: API key not found." });
    }

    // Make request to Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Gemini API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Return the response from Gemini API
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return res.status(500).json({
      error: "Internal server error occurred while processing your request.",
    });
  }
}
