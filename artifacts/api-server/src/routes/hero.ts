import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server";
const router = Router();

interface HeroImageBody {
  character?: unknown;
  primaryColor?: unknown;
  backgroundColor?: unknown;
}

// Map a character name to a broad, content-safe archetype descriptor
async function resolveArchetype(character: string): Promise<string> {
  const res = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `You map a character name to a short, generic archetype phrase suitable for image generation.
Output ONLY a 3-6 word phrase. No character names, no brand names, no trademarks.
Examples:
- "Iron Man" → "armored technological warrior"
- "Hermione" → "young scholarly magic wielder"
- "Batman" → "dark brooding vigilante of the night"
- "Thor" → "ancient warrior god with lightning"
- "Spider-Man" → "agile acrobatic urban hero"
- "Sherlock Holmes" → "sharp-eyed detective in Victorian coat"
- "Darth Vader" → "dark-armored imposing villain"
Output the phrase only. No quotes, no punctuation at the end.`,
      },
      { role: "user", content: character },
    ],
  });
  return res.choices[0]?.message?.content?.trim() ?? "mysterious cloaked hero";
}

router.post("/hero/image", async (req, res) => {
  const body = req.body as HeroImageBody;
  if (typeof body.character !== "string" || !body.character.trim()) {
    res.status(400).json({ error: "Invalid request body: character is required" });
    return;
  }

  const character = body.character.trim();
  const primaryColor = typeof body.primaryColor === "string" ? body.primaryColor : "#00d4ff";
  const backgroundColor = typeof body.backgroundColor === "string" ? body.backgroundColor : "#0a0e1a";

  try {
    // Step 1 — resolve archetype (avoids trademark names in image prompt)
    const archetype = await resolveArchetype(character);

    // Step 2 — build a fully abstract, moderation-safe cinematic portrait prompt
    // Uses the character's theme color as a lighting direction, not their costume
    const colorName = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: "Convert a hex color to a cinematic lighting descriptor, 2-4 words. Examples: #00d4ff → 'electric cyan neon', #ff0000 → 'deep crimson fire', #ffd700 → 'warm golden radiance'. Output only the descriptor.",
        },
        { role: "user", content: primaryColor },
      ],
    });
    const lightingDesc = colorName.choices[0]?.message?.content?.trim() ?? "cool blue neon";

    const bgColorName = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: "Name a background atmosphere color in 2-3 words, e.g. 'deep midnight black', 'dark obsidian', 'midnight navy'. Output only the descriptor.",
        },
        { role: "user", content: backgroundColor },
      ],
    });
    const bgDesc = bgColorName.choices[0]?.message?.content?.trim() ?? "deep black void";

    const prompt = `Cinematic portrait of a ${archetype}. Low-angle heroic composition from waist to top of head. Dramatic ${lightingDesc} rim light from one side, deep shadow on the other. ${bgDesc} background with subtle atmospheric haze. No face clearly visible — silhouetted or dramatically shadowed. Ultra-detailed, photorealistic, anamorphic lens bokeh, film grain, no text, no watermarks, no logos, no real people.`;

    // Step 3 — generate with gpt-image-1
    const imageBuffer = await generateImageBuffer(prompt, "1024x1024");
    const base64 = imageBuffer.toString("base64");

    res.json({ imageUrl: `data:image/png;base64,${base64}` });
  } catch (err) {
    req.log.error({ err }, "Hero image generation failed");
    res.status(500).json({ error: "Hero image generation failed" });
  }
});

export default router;
