import { useEffect, useState } from 'react';
import { fetchLectures } from '@/lib/api';
import { Lecture } from '@/types/Lecture';

export default function DashboardPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);

  useEffect(() => {
    fetchLectures().then(setLectures);
  }, []);

  const total = lectures.length;
  const listened = lectures.filter(l => l.listened).length;
  const bookmarked = lectures.filter(l => l.bookmarked).length;
  const noted = lectures.filter(l => l.notes?.trim()).length;

  const percent = total ? Math.round((listened / total) * 100) : 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📊 Your Bhagavad Gita Sadhana Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Lectures" value={total} />
        <StatCard label="Listened" value={listened} />
        <StatCard label="Bookmarked" value={bookmarked} />
        <StatCard label="With Notes" value={noted} />
      </div>

      <div className="mt-6 bg-white shadow p-6 rounded-xl max-w-md">
        <h2 className="text-lg font-semibold mb-2">🎯 Progress</h2>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">{percent}% completed</p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white shadow rounded-xl p-4 text-center">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}
