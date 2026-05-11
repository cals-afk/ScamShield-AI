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

  const { message, inputType } = parse.data;

  if (!message.trim()) {
    res.status(400).json({ error: "Message cannot be empty" });
    return;
  }

  const isPhoneNumber = inputType === "phone_number";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: isPhoneNumber
            ? `You are a helpful cybersecurity assistant. Your job is to check phone numbers and explain your findings to people who know nothing about scams or technology. Write like a smart, calm friend — not a robot.

Tone rules (follow these strictly):
- Use short sentences. Maximum 15 words per sentence.
- No technical jargon. No acronyms unless you explain them.
- Be direct and warm. Sound like a calm, knowledgeable friend.
- Never robotic or cold.

For SAFE numbers (scamPercentage 0-20): Be genuinely reassuring. Do not say "no signs of danger" — instead say what makes it look legitimate. Explain what a real business number looks like and confirm this matches. Sound confident and calm.
For SUSPICIOUS or SCAM numbers: Be clear and protective. Explain simply what is wrong and what the user should do.

Analyse the phone number and return a JSON object with these exact fields:

- scamPercentage: integer 0-100
- verdict: one of "safe" (0-20%), "suspicious" (21-50%), "likely_scam" (51-80%), "definite_scam" (81-100%)
- explanation: one sentence. Safe example: "This looks like a normal business number — nothing stands out as suspicious." Scam example: "This number has several signs of a scam call."
- threatType: 2-4 word label. Safe examples: "Looks Legitimate", "Standard Mobile". Scam examples: "Robocall Scam", "Spoofed Number", "Premium Rate Fraud"
- whySuspicious: 2-3 short sentences. For SAFE: explain the positive signals — what makes it look genuine. Example: "This is a standard mobile number from India. The format is normal and matches what real businesses use. There are no unusual prefixes or patterns here." For SCAM: explain what looks wrong and why it is a trick.
- recommendedAction: one sentence starting with a verb. Safe examples: "You are good to go — just never share passwords or OTPs over any call." Scam examples: "Block this number and do not call back."
- flaggedTechniques: empty array [] for safe numbers. For scam numbers, pick from: "urgency", "suspicious_link", "reward_bait", "phishing_language", "otp_request", "impersonation", "personal_info_request", "fear_tactics", "too_good_to_be_true".
- indicators: 3-5 items, each with:
  - type: "red_flag", "yellow_flag", or "safe_signal"
  - description: one short sentence. For safe results, use "safe_signal" for most indicators.

Respond ONLY with valid JSON. No markdown. No explanation outside the JSON.`
            : `You are a helpful cybersecurity assistant. Your job is to check messages and explain your findings to people who know nothing about scams or technology. Write like a smart, calm friend — not a robot.

Tone rules (follow these strictly):
- Use short sentences. Maximum 15 words per sentence.
- No technical jargon. No acronyms unless you explain them.
- Be direct and warm. Sound like a calm, knowledgeable friend.
- Never robotic or stiff.

For SAFE messages (scamPercentage 0-20): Be genuinely reassuring. Do not just say "no red flags found" — explain what makes the message look legitimate. Be warm, confident, and calm. Make the user feel secure.
For SUSPICIOUS or SCAM messages: Be clear and protective. Explain simply what the scammer is trying to do and why it is a trick.

Analyse the message and return a JSON object with these exact fields:

- scamPercentage: integer 0-100
- verdict: one of "safe" (0-20%), "suspicious" (21-50%), "likely_scam" (51-80%), "definite_scam" (81-100%)
- explanation: one sentence. Safe example: "This looks like a genuine message — nothing suspicious stands out." Scam example: "This message is trying to trick you into clicking a fake link."
- threatType: 2-4 word label. Safe examples: "Looks Genuine", "Verified Message", "Normal Notification". Scam examples: "Prize Scam", "Phishing Link", "Bank Impersonation", "Fake Delivery"
- whySuspicious: 2-3 short sentences. For SAFE results, use this field to explain what makes the message look genuine — not just the absence of red flags. Example: "This message matches the style of a real delivery notification. The link goes to an official company website. There are no unusual requests or pressure tactics." For SCAM results, explain what the scammer is trying to do.
- recommendedAction: one sentence starting with a verb. Safe examples: "You are safe — but always type important website addresses directly into your browser rather than clicking links." Scam examples: "Delete this message and do not click any links."
- flaggedTechniques: empty array [] for safe messages. For scam messages, pick only the ones that apply from: "urgency", "suspicious_link", "reward_bait", "phishing_language", "otp_request", "impersonation", "personal_info_request", "fear_tactics", "too_good_to_be_true".
- indicators: 3-5 items, each with:
  - type: "red_flag", "yellow_flag", or "safe_signal"
  - description: one short sentence. For safe results, use "safe_signal" for most or all indicators.

Respond ONLY with valid JSON. No markdown. No explanation outside the JSON.`,
        },
        {
          role: "user",
          content: isPhoneNumber
            ? `Check this phone number for scam indicators:\n\n${message}`
            : `Analyse this message for scam indicators:\n\n${message}`,
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

    const validTechniques = [
      "urgency", "suspicious_link", "reward_bait", "phishing_language",
      "otp_request", "impersonation", "personal_info_request", "fear_tactics",
      "too_good_to_be_true",
    ];
    const flaggedTechniques = Array.isArray(parsed.flaggedTechniques)
      ? parsed.flaggedTechniques.filter((t: unknown) => validTechniques.includes(String(t)))
      : [];

    res.json({
      scamPercentage,
      verdict,
      explanation: String(parsed.explanation || ""),
      threatType: String(parsed.threatType || "Unknown"),
      whySuspicious: String(parsed.whySuspicious || ""),
      recommendedAction: String(parsed.recommendedAction || ""),
      flaggedTechniques,
      indicators,
    });
  } catch (err) {
    req.log.error({ err }, "Scam analysis failed");
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

export default router;
