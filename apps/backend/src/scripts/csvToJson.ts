// file: scripts/convert-csv-to-json.ts

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const inputCsvPath = path.join(__dirname, '../data/prabhupada_bg_lectures.csv');
const outputJsonPath = path.join(__dirname, '../data/bg_lectures.json');

const BASE_URL = 'https://audio.iskcondesiretree.com/01_-_Srila_Prabhupada/01_-_Lectures/01_-_English/01_-_Topic_wise/Bhagavad_Gita';

type Lecture = {
  chapter: number;
  verseRange: string;
  location: string;
  date: string;
  title: string;
  filename: string;
  audioUrl: string;
};

const lectures: Lecture[] = [];

function parseFilename(filename: string): Omit<Lecture, 'chapter' | 'filename' | 'audioUrl'> {
  const parts = filename.split(' ');
  const verseRange = parts[2];
  const location = parts[3];
  const date = parts[4];
  const title = parts.slice(5).join(' ');
  return { verseRange, location, date, title };
}

fs.createReadStream(inputCsvPath)
  .pipe(csv())
  .on('data', (row) => {
    const chapter = parseInt(row['Chapter'], 10);
    const rawFilename = row['Filename'];

    if (rawFilename && rawFilename.trim() !== '') {
      const { verseRange, location, date, title } = parseFilename(rawFilename.trim());

      const paddedChapter = chapter.toString().padStart(2, '0');
      const underscoredFilename = rawFilename.trim().replace(/ /g, '_') + '.mp3';
      const audioUrl = `${BASE_URL}/Chapter-${paddedChapter}/${underscoredFilename}`;

      lectures.push({
        chapter,
        verseRange,
        location,
        date,
        title,
        filename: rawFilename.trim(),
        audioUrl,
      });
    }
  })
  .on('end', () => {
    fs.writeFileSync(outputJsonPath, JSON.stringify(lectures, null, 2));
    console.log(`✅ Generated ${lectures.length} lectures → bg_lectures.json`);
  });
