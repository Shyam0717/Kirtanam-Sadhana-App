import express from 'express';
import { getDb } from '../db/db';

const router = express.Router();

// GET /lectures - get all
router.get('/', async (req, res) => {
  const db = await getDb();
  res.json(db.data!.lectures);
});

// GET /lectures/:id - get one
router.get('/:id', async (req, res) => {
  const db = await getDb();
  const lecture = db.data!.lectures.find(l => l.id === parseInt(req.params.id));
  if (!lecture) return res.status(404).json({ error: 'Lecture not found' });
  res.json(lecture);
});

// PATCH /lectures/:id - update a lecture
router.patch('/:id', async (req, res) => {
  const db = await getDb();
  const lecture = db.data!.lectures.find(l => l.id === parseInt(req.params.id));
  if (!lecture) return res.status(404).json({ error: 'Lecture not found' });

  const { listened, bookmarked, notes, summary } = req.body;

  if (typeof listened === 'boolean') lecture.listened = listened;
  if (typeof bookmarked === 'boolean') lecture.bookmarked = bookmarked;
  if (typeof notes === 'string') lecture.notes = notes;
  if (typeof summary === 'string') lecture.summary = summary;

  await db.write();
  res.json({ message: 'Updated successfully', lecture });
});

export default router;
