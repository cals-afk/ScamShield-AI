import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server";
import { GenerateHeroImageBody } from "@workspace/api-zod";

const router = Router();

router.post("/hero/image", async (req, res) => {
  const parse = GenerateHeroImageBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body: character is required" });
    return;
  }

  const { character } = parse.data;

  try {
    // Step 1 — GPT writes a detailed visual description so gpt-image-1
    // receives precise costume / lighting / mood details
    const descCompletion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: `You are a senior concept artist who writes image-generation prompts for AAA game cinematics and superhero movie VFX.
Given a character name, produce a precise, hyper-detailed visual description for gpt-image-1.

Rules:
- Do NOT include the character's real name or brand names.
- Describe the exact costume: dominant colours, material textures (matte, glossy, metallic, leather, nano-mesh), distinctive silhouette, logos/symbols, glowing elements.
- Describe the face/helmet/mask clearly.
- Lighting: one strong coloured rim light on one side, deep shadow on the other, subtle volumetric haze.
- Framing: slightly low-angle, close-up from waist to top of head, heroic.
- Background: near-black void, very subtle matching atmospheric glow.
- Style: cinematic, photorealistic, ultra-detailed, game-render quality.
- Output exactly 3 sentences. No line breaks, no bullets.`,
        },
        {
          role: "user",
          content: `Write the image-generation description for: ${character}`,
        },
      ],
    });

    const visualDescription =
      descCompletion.choices[0]?.message?.content?.trim() ?? character;

    // Step 2 — generate image with gpt-image-1 (the supported model)
    const imageBuffer = await generateImageBuffer(
      `Photorealistic cinematic superhero portrait. ${visualDescription} Dark moody atmosphere, anamorphic lens, film grain, no text, no watermarks, no logos.`,
      "1024x1024",
    );

    // Return as a data URL so the browser can render it directly
    const base64 = imageBuffer.toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    res.json({ imageUrl: dataUrl });
  } catch (err) {
    req.log.error({ err }, "Hero image generation failed");
    res.status(500).json({ error: "Hero image generation failed" });
  }
});

export default router;
