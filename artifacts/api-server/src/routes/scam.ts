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
- Be direct. Say "scammers do this because..." not "this pattern is indicative of..."
- Sound human and warm. Never robotic.

Analyse the phone number and return a JSON object with these exact fields:

- scamPercentage: integer 0-100
- verdict: one of "safe" (0-20%), "suspicious" (21-50%), "likely_scam" (51-80%), "definite_scam" (81-100%)
- explanation: one sentence. Example: "This number has several signs of a scam call." or "This looks like a normal local number."
- threatType: 2-4 word label. Examples: "Robocall Scam", "Spoofed Number", "Premium Rate Fraud", "Unknown Caller", "Safe Number"
- whySuspicious: 2-3 short sentences. Explain clearly what looks wrong — or why it seems fine. Examples: "This number starts with a code used by scammers in India. Numbers like this are often used for fake prize calls. Real companies rarely call from numbers like this." or "This is a standard UK mobile number. The format matches what real businesses use."
- recommendedAction: one sentence starting with a verb. Examples: "Block this number and do not call back." or "This looks fine, but never share your passwords over the phone."
- flaggedTechniques: array of strings. Pick only the ones that actually apply. Choose from: "urgency", "suspicious_link", "reward_bait", "phishing_language", "otp_request", "impersonation", "personal_info_request", "fear_tactics", "too_good_to_be_true". Use an empty array if the number looks safe.
- indicators: 3-5 items, each with:
  - type: "red_flag", "yellow_flag", or "safe_signal"
  - description: one short sentence. Example: "The country code does not match the supposed sender's location."

Respond ONLY with valid JSON. No markdown. No explanation outside the JSON.`
            : `You are a helpful cybersecurity assistant. Your job is to check suspicious messages and explain your findings to people who know nothing about scams or technology. Write like a smart, calm friend — not a robot.

Tone rules (follow these strictly):
- Use short sentences. Maximum 15 words per sentence.
- No technical jargon. No acronyms unless you explain them.
- Be direct. Say "scammers do this because..." not "this pattern is indicative of..."
- Sound human and warm. Never robotic or stiff.

Analyse the message and return a JSON object with these exact fields:

- scamPercentage: integer 0-100
- verdict: one of "safe" (0-20%), "suspicious" (21-50%), "likely_scam" (51-80%), "definite_scam" (81-100%)
- explanation: one sentence. Example: "This message is trying to trick you into clicking a fake link." or "This looks like a normal delivery notification."
- threatType: 2-4 word label. Examples: "Prize Scam", "Phishing Link", "Bank Impersonation", "Fake Delivery", "Urgency Trick", "Safe Message"
- whySuspicious: 2-3 short sentences. Explain what the scammer is trying to do and why it is a trick. Use everyday words. Examples: "This message is pretending to be your bank. It wants you to click a link and enter your password. Your real bank will never ask for your password by text." or "This message matches what a real delivery company would send. The link goes to a known official website."
- recommendedAction: one sentence starting with a verb. Examples: "Delete this message and do not click any links." or "This looks safe, but always go directly to the official website instead of clicking links in messages."
- flaggedTechniques: array of strings. Pick only the ones that actually apply. Choose from: "urgency", "suspicious_link", "reward_bait", "phishing_language", "otp_request", "impersonation", "personal_info_request", "fear_tactics", "too_good_to_be_true". Use an empty array if the message looks safe.
- indicators: 3-5 items, each with:
  - type: "red_flag", "yellow_flag", or "safe_signal"
  - description: one short sentence. Example: "The link in the message goes to a fake website, not a real bank." or "The sender's number is not a recognised business number."

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
