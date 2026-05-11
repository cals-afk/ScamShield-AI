import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
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
    // Step 1 — ask GPT to write a detailed cinematic visual description
    // so DALL-E receives exact costume / material / lighting details
    // instead of just a name that may hit copyright filters
    const descCompletion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: `You are a senior concept artist who writes image-generation prompts for AAA game cinematics and superhero movie VFX.
Given a character name, produce a precise, hyper-detailed visual description that can be fed to DALL-E 3.

Rules:
- Do NOT include the character's real name or brand names.
- Describe the exact costume in detail: dominant colours, material textures (matte, glossy, metallic, leather, nano-mesh, etc.), distinctive silhouette, logos/symbols on the suit, glowing elements.
- Describe the face/helmet/mask clearly.
- Describe the lighting: one strong coloured rim light, deep fill shadow on the opposite side, thin separation light.
- Pose: powerful, standing, slightly low-angle camera looking up (heroic framing), close-up from waist to top of head.
- Background: near-black void with very subtle fog/haze and matching coloured atmospheric glow.
- Output exactly 3–4 sentences. No line breaks, no bullets.`,
        },
        {
          role: "user",
          content: `Write the cinematic DALL-E prompt description for: ${character}`,
        },
      ],
    });

    const visualDescription =
      descCompletion.choices[0]?.message?.content?.trim() ?? character;

    // Step 2 — generate image with HD quality using the rich visual description
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Photorealistic cinematic superhero portrait. ${visualDescription} Shot on a RED cinema camera, anamorphic lens flare, f/1.4 bokeh, volumetric god rays, ultra-high detail, 8K textures, no watermarks, no text, dark moody atmosphere, PlayStation 5 / Unreal Engine 5 photorealistic quality.`,
      n: 1,
      size: "1024x1792",
      quality: "hd",
    });

    const imageUrl = imageResponse.data?.[0]?.url;
    if (!imageUrl) {
      res.status(500).json({ error: "No image returned from AI" });
      return;
    }

    res.json({ imageUrl });
  } catch (err) {
    req.log.error({ err }, "Hero image generation failed");
    res.status(500).json({ error: "Hero image generation failed" });
  }
});

export default router;
