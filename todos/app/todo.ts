export type Todo = {
  id: number;
  title: string;
  completed: number; // 0 or 1
  due_date: string | null; // ISO datetime: '2026-08-18T14:30:00.000Z'
  notes: string | null;
};
