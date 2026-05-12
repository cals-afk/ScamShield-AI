import { Router } from "express";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server";

const router = Router();

interface HeroImageBody {
  character?: unknown;
  /**
   * Full image prompt crafted by the frontend from the mode's pre-defined
   * imagePrompt field. Avoids any extra LLM calls server-side.
   */
  imagePrompt?: unknown;
}

router.post("/hero/image", async (req, res) => {
  const body = req.body as HeroImageBody;

  if (typeof body.character !== "string" || !body.character.trim()) {
    res.status(400).json({ error: "character is required" });
    return;
  }

  // Use the frontend-supplied prompt when available (preferred path).
  // The prompt is pre-crafted from the mode's imagePrompt constant —
  // fully abstract, no trademark references, minimal moderation risk.
  const basePrompt =
    typeof body.imagePrompt === "string" && body.imagePrompt.trim()
      ? body.imagePrompt.trim()
      : "A mysterious silhouetted figure standing in dramatic neon light, futuristic dark environment";

  const fullPrompt = [
    basePrompt,
    "Low-angle cinematic composition, waist to top of head.",
    "Face not clearly visible — silhouetted or dramatically shadowed.",
    "Ultra-detailed photorealistic render, anamorphic lens bokeh, film grain, atmospheric depth.",
    "No text, no watermarks, no logos.",
  ].join(" ");

  try {
    const imageBuffer = await generateImageBuffer(fullPrompt, "1024x1024");
    const base64 = imageBuffer.toString("base64");
    res.json({ imageUrl: `data:image/png;base64,${base64}` });
  } catch (err) {
    req.log.error({ err }, "Hero image generation failed");
    res.status(500).json({ error: "Hero image generation failed" });
  }
});

export default router;
