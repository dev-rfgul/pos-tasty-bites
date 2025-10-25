import React, { useEffect, useState } from 'react';
import API from '../api/api';

type ReportStats = {
  totalSales: number;
  totalCost: number;
  profit: number;
  ordersCount: number;
  topItems?: { name: string; qty: number }[];
};

export default function Dashboard() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<'today' | '7days' | 'all'>('today');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const now = new Date();
        let fromStr: string | null = null;
        let toStr: string | null = null;

        if (range === 'today') {
          const from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10);
          const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString().slice(0, 10);
          fromStr = from;
          toStr = to;
        } else if (range === '7days') {
          const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          start.setDate(start.getDate() - 6); // include today = 7 days
          fromStr = start.toISOString().slice(0, 10);
          toStr = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString().slice(0, 10);
        } else if (range === 'all') {
          fromStr = '1970-01-01';
          toStr = '2100-01-01';
        }

        const query = fromStr && toStr ? `?from=${fromStr}&to=${toStr}` : '';
        const res = await API.get(`/api/reports/sales${query}`);
        console.log(res.data);
        setStats(res.data || null);
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e: any = err;
        setError(e?.response?.data?.error || 'Failed to load dashboard data');
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [range]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => setRange('today')} className={`px-3 py-1 rounded ${range === 'today' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Today</button>
        <button onClick={() => setRange('7days')} className={`px-3 py-1 rounded ${range === '7days' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Last 7 days</button>
        <button onClick={() => setRange('all')} className={`px-3 py-1 rounded ${range === 'all' ? 'bg-blue-600 text-white' : 'bg-white'}`}>All time</button>
      </div>

      {loading ? (
        <div>Loading dashboard...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded shadow">Today's sales: {stats ? stats.totalSales.toFixed(2) : '0.00'}</div>
          <div className="p-4 bg-white rounded shadow">Paid orders: {stats ? stats.ordersCount : 0}</div>
          <div className="p-4 bg-white rounded shadow">Profit: {stats ? stats.profit.toFixed(2) : '0.00'}</div>
        </div>
      )}
    </div>
  );
}
