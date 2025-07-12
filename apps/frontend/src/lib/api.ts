export async function fetchLectures() {
  const res = await fetch('http://localhost:4000/lectures');
  return res.json();
}

export async function fetchLecture(id: number) {
  const res = await fetch(`http://localhost:4000/lectures/${id}`);
  return res.json();
}

export async function updateLecture(id: number, updates: Partial<any>) {
  const res = await fetch(`http://localhost:4000/lectures/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function summarizeLecture(id: number) {
  const res = await fetch(`http://localhost:4000/lectures/${id}/summarize`, {
    method: 'POST',
  });
  return res.json();
}
