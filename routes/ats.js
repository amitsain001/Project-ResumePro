const express = require("express");
const multer = require("multer");
const mammoth = require("mammoth");
const fs = require("fs");
const OpenAI = require("openai");

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const pdfParse = require("pdf-parse");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GET → form page
router.get("/", (req, res) => {
  res.render("ats/form");
});

// POST → ATS check
router.post("/check-ats", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.send("File upload failed");
    }

    const jobDescription = req.body.jobDescription;
    const filePath = req.file.path;

    let resumeText = "";

    console.log(typeof pdfParse);
    console.log("pdfParse:", pdfParse);

    if (req.file.mimetype.includes("pdf")) {
        const dataBuffer = fs.readFileSync(filePath);

        const pdfData = await pdfParse(dataBuffer); // ✅ works directly

        resumeText = pdfData.text;
    } else {
      const result = await mammoth.extractRawText({ path: filePath });
      resumeText = result.value;
    }

//     const response = await openai.chat.completions.create({
//       model: "gpt-4.1-mini",
//       messages: [
//         {
//           role: "system",
//           content: "Return ONLY valid JSON.",
//         },
//         {
//           role: "user",
//           content: `
// Analyze resume vs job description.

// Return JSON:
// {
//   "score": number,
//   "missing_keywords": [],
//   "strengths": [],
//   "weaknesses": [],
//   "suggestions": []
// }

// JD:
// ${jobDescription}

// Resume:
// ${resumeText}
//           `,
//         },
//       ],
//     });

    // const raw = response.choices[0].message.content;
    // console.log("RAW:", raw);

    // const jsonMatch = raw.match(/\{[\s\S]*\}/);

    // if (!jsonMatch) {
    //   return res.send("Invalid AI response");
    // }

    const result = {
        score: 75,
        missing_keywords: ["Redux", "JWT"],
        strengths: ["Strong Node.js", "Good projects"],
        weaknesses: ["No testing mentioned"],
        suggestions: ["Add JWT", "Include testing tools"]
    };

    return res.render("ats/result", { result });

    } catch (error) {
        console.error("FULL ERROR:", error);
        res.send("ATS check failed");
    }
});

module.exports = router;