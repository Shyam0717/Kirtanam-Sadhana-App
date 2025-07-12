import fs from 'fs';
import path from 'path';
import { getDb } from './db';

const dataPath = path.resolve(__dirname, '../../backend/src/data/bg_lectures.json');
const rawLectures = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

async function seed() {
  const db = await getDb();

  const lectures = rawLectures.map((lecture: any, index: number) => ({
    id: index + 1,
    ...lecture,
    listened: false,
    bookmarked: false,
    notes: '',
    summary: '',
  }));

  db.data!.lectures = lectures;
  await db.write();
  console.log(`✅ Seeded ${lectures.length} lectures to lectures.json`);
}

seed();
