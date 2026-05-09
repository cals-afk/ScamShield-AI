import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateThemeBody } from "@workspace/api-zod";

const router = Router();

const PARTICLE_SHAPES = ["circle", "triangle", "diamond", "hex", "star"] as const;

router.post("/theme/generate", async (req, res) => {
  const parse = GenerateThemeBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body: character is required" });
    return;
  }

  const { character } = parse.data;

  if (!character.trim()) {
    res.status(400).json({ error: "Character name cannot be empty" });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: `You are a futuristic UI theme designer for a cybersecurity AI interface.
Given a character or hero name, generate a color theme for a dark futuristic cybersecurity dashboard.

Rules:
- Colors must look great on a dark near-black background
- Use vivid, saturated neon/glowing colors inspired by the character's aesthetic
- All colors must be hex codes
- backgroundColor must be very dark (luminance < 15%)
- foregroundColor must be light/readable on the dark background
- primaryColor is the main accent/glow color — make it distinctive and character-inspired
- secondaryColor complements the primary
- accentColor is used for highlights and special effects

Respond ONLY with valid JSON matching this exact structure, no markdown:
{
  "primaryColor": "#xxxxxx",
  "secondaryColor": "#xxxxxx",
  "accentColor": "#xxxxxx",
  "backgroundColor": "#xxxxxx",
  "foregroundColor": "#xxxxxx",
  "label": "UPPERCASE SHORT LABEL (e.g. STARK PROTOCOL, SPIDER SENSE, BLADE MODE)",
  "tagline": "Short cinematic tagline shown during activation (1 sentence, dramatic, cyber-themed)",
  "particleShape": "circle|triangle|diamond|hex|star"
}`,
        },
        {
          role: "user",
          content: `Generate a dark futuristic cybersecurity theme inspired by: ${character}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      res.status(500).json({ error: "No response from AI" });
      return;
    }

    const parsed = JSON.parse(raw);

    const particleShape = PARTICLE_SHAPES.includes(parsed.particleShape)
      ? parsed.particleShape
      : "circle";

    res.json({
      primaryColor: String(parsed.primaryColor || "#00d4ff"),
      secondaryColor: String(parsed.secondaryColor || "#0066ff"),
      accentColor: String(parsed.accentColor || "#00ffaa"),
      backgroundColor: String(parsed.backgroundColor || "#0a0e1a"),
      foregroundColor: String(parsed.foregroundColor || "#e0f8ff"),
      label: String(parsed.label || character.toUpperCase() + " MODE"),
      tagline: String(parsed.tagline || "Identity confirmed. System online."),
      particleShape,
    });
  } catch (err) {
    req.log.error({ err }, "Theme generation failed");
    res.status(500).json({ error: "Theme generation failed. Please try again." });
  }
});

export default router;
