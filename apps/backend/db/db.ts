import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';

type Lecture = {
  id: number;
  chapter: number;
  verseRange: string;
  location: string;
  date: string;
  title: string;
  filename: string;
  audioUrl: string;
  listened: boolean;
  bookmarked: boolean;
  notes: string;
  summary: string;
};

type Data = {
  lectures: Lecture[];
};

const file = path.join(__dirname, './lectures.json');
const adapter = new JSONFile<Data>(file);
const defaultData: Data = { lectures: [] }
const db = new Low<Data>(adapter, defaultData)

export async function getDb() { 
  await db.read();
  db.data ||= { lectures: [] };
  return db;
}
