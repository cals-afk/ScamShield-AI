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
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Cinematic dark dramatic portrait of ${character}, photorealistic game render quality, extreme rim lighting on one side, volumetric fog, near-black background, heroic standing pose, ultra detailed costume, dramatic shadows, moody atmospheric lighting, close up chest and face framing, dark cinematic superhero aesthetic`,
      n: 1,
      size: "1024x1792",
      quality: "standard",
    });

    const imageUrl = response.data?.[0]?.url;
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
