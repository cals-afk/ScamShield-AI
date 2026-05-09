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
          content: `You are a friendly security assistant helping everyday people spot scams. Write as if explaining to a friend who is not technical at all.

Analyse the message and return a JSON object with these exact fields:

- scamPercentage: integer 0-100 (0 = definitely safe, 100 = definite scam)
- verdict: one of "safe" (0-20%), "suspicious" (21-50%), "likely_scam" (51-80%), "definite_scam" (81-100%)
- explanation: one short sentence summarising your overall verdict in plain English
- threatType: a short label for the kind of threat (e.g. "Prize Scam", "Phishing Link", "Impersonation", "Urgency Trick", "Safe Message")
- whySuspicious: 2-3 short sentences in plain, everyday language explaining WHY this message looks dangerous (or safe). Use simple words. Avoid technical jargon. Explain what the scammer is trying to do and why it is a trick. Example style: "This message is trying to rush you into clicking a link by pretending you won something. Real companies do not give out expensive prizes through random texts."
- recommendedAction: one clear sentence telling the user exactly what to do. Start with an action verb. Example: "Do not click any links in this message and delete it immediately." or "This looks safe, but always double-check before sharing personal information."
- indicators: array of objects with:
  - type: "red_flag", "yellow_flag", or "safe_signal"
  - description: one short plain-English sentence describing this specific signal

Keep all text short, friendly, and jargon-free. Respond ONLY with valid JSON, no markdown.`,
        },
        {
          role: "user",
          content: `Analyse this message for scam indicators:\n\n${message}`,
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
      threatType: String(parsed.threatType || "Unknown"),
      whySuspicious: String(parsed.whySuspicious || ""),
      recommendedAction: String(parsed.recommendedAction || ""),
      indicators,
    });
  } catch (err) {
    req.log.error({ err }, "Scam analysis failed");
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

export default router;
