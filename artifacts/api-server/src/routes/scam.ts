import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { AnalyseMessageBody } from "@workspace/api-zod";

const router = Router();

router.post("/scam/analyse", async (req, res) => {
  const parse = AnalyseMessageBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body: message is required" });
    return;
  }

  const { message } = parse.data;

  if (!message.trim()) {
    res.status(400).json({ error: "Message cannot be empty" });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: `You are a cybersecurity expert specializing in scam, phishing, and social engineering detection. 
Analyse the provided message and return a JSON object with:
- scamPercentage: integer 0-100 (0 = definitely safe, 100 = definite scam)
- verdict: one of "safe" (0-20%), "suspicious" (21-50%), "likely_scam" (51-80%), "definite_scam" (81-100%)
- explanation: clear, plain-language explanation of your findings (2-4 sentences)
- indicators: array of objects with type ("red_flag", "yellow_flag", or "safe_signal"), and description

Be precise, thorough, and consider: urgency language, impersonation, suspicious URLs, requests for personal info, grammatical errors, too-good-to-be-true offers, pressure tactics, and unusual payment requests.

Respond ONLY with valid JSON, no markdown.`,
        },
        {
          role: "user",
          content: `Analyse this message for scam indicators:\n\n${message}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      res.status(500).json({ error: "No response from AI" });
      return;
    }

    const parsed = JSON.parse(raw);

    const scamPercentage = Math.max(0, Math.min(100, Number(parsed.scamPercentage) || 0));

    let verdict: string = parsed.verdict;
    if (!["safe", "suspicious", "likely_scam", "definite_scam"].includes(verdict)) {
      if (scamPercentage <= 20) verdict = "safe";
      else if (scamPercentage <= 50) verdict = "suspicious";
      else if (scamPercentage <= 80) verdict = "likely_scam";
      else verdict = "definite_scam";
    }

    const indicators = Array.isArray(parsed.indicators)
      ? parsed.indicators.map((ind: { type?: string; description?: string }) => ({
          type: ["red_flag", "yellow_flag", "safe_signal"].includes(ind.type ?? "")
            ? ind.type
            : "yellow_flag",
          description: String(ind.description || ""),
        }))
      : [];

    res.json({
      scamPercentage,
      verdict,
      explanation: String(parsed.explanation || ""),
      indicators,
    });
  } catch (err) {
    req.log.error({ err }, "Scam analysis failed");
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

export default router;
