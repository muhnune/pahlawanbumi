export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Method not allowed. Only POST requests are accepted." });
  }

  try {
    // Get text from request body
    const { text } = req.body;

    if (!text) {
      return res
        .status(400)
        .json({ error: "Text is required in request body." });
    }

    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment variables");
      return res
        .status(500)
        .json({ error: "Server configuration error: API key not found." });
    }

    // Make request to Gemini TTS API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Ucapkan dengan suara yang ramah dan jelas untuk anak-anak: ${text}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Puck",
            },
          },
        },
      },
      model: "gemini-2.5-flash-preview-tts",
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Gemini TTS API responded with status: ${response.status}`
      );
    }

    const data = await response.json();

    // Return the response from Gemini TTS API
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error calling Gemini TTS API:", error);
    return res.status(500).json({
      error: "Internal server error occurred while processing TTS request.",
    });
  }
}
