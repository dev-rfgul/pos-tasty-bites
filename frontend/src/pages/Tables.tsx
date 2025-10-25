import React, { useEffect, useState } from 'react';
import API from '../api/api';

export default function TablesPage() {
  const [tables, setTables] = useState<any[]>([]);

  useEffect(() => {
    API.get('/api/tables').then((r) => setTables(r.data)).catch(() => setTables([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tables</h1>
      <div className="grid grid-cols-4 gap-3">
        {tables.map((t) => (
          <div key={t._id} className="p-3 bg-white rounded shadow">{t.name} — {t.status}</div>
        ))}
      </div>
    </div>
  );
}
