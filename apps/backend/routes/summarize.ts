// backend/routes/summarize.ts

import express from 'express';
import { getDb } from '../db/db';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Import GoogleGenerativeAI
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Gemini
// Access your API key as an environment variable (see "How to get your Gemini API Key" below)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string); // Use GEMINI_API_KEY

router.post('/:id/summarize', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const db = await getDb();

  const lecture = db.data.lectures.find((l) => l.id === id);
  if (!lecture) {
    return res.status(404).json({ error: 'Lecture not found' });
  }

  try {
    const mockTranscript = `Lecture title: ${lecture.title}\nChapter: ${lecture.chapter}\nContent: Simulated transcript from Srila Prabhupada's lecture.`;

    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a devotional assistant who summarizes Srila Prabhupada’s Bhagavad Gita lectures in a respectful and concise way.
    Summarize this:\n\n${mockTranscript}`;

    const result = await model.generateContent(prompt); // Use generateContent
    const response = await result.response;
    const summary = response.text(); // Extract text content

    lecture.summary = summary;
    console.log('lecture.summary', summary);
    await db.write();

    res.json({ summary });
  } catch (err) {
    console.error('[AI Summary Error]', err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

export default router;