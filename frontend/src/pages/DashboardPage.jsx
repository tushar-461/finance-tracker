import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { analyticsApi, getApiErrorMessage } from "../api/client";
import { formatCurrency } from "../utils/format";

const fallback = {
  trend: [
    { month: "Jan", income: 3400, expense: 2000 },
    { month: "Feb", income: 3200, expense: 2150 },
    { month: "Mar", income: 3600, expense: 2300 },
    { month: "Apr", income: 3700, expense: 2500 },
  ],
  categoryBreakdown: [
    { name: "Food", value: 700 },
    { name: "Transport", value: 300 },
    { name: "Entertainment", value: 450 },
    { name: "Utilities", value: 350 },
  ],
  yearly: [
    { year: "2024", amount: 18000 },
    { year: "2025", amount: 21200 },
  ],
};

export default function DashboardPage() {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await analyticsApi.summary({ period: "monthly" });
        const payload = response?.data;
        if (payload?.trend && payload?.categoryBreakdown && payload?.yearly) {
          setData(payload);
          return;
        }
        throw new Error("Unexpected analytics response.");
      } catch (err) {
        setError(getApiErrorMessage(err, "Using local demo analytics."));
        setData(fallback);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totals = useMemo(() => {
    const income = data.trend.reduce((sum, item) => sum + item.income, 0);
    const expense = data.trend.reduce((sum, item) => sum + item.expense, 0);
    return { income, expense, net: income - expense };
  }, [data]);

  return (
    <section>
      <h1>Dashboard</h1>
      {loading && <p className="muted">Loading analytics...</p>}
      {error && <p className="error">{error}</p>}

      <div className="stats-grid">
        <article className="card stat">
          <h3>Total Income</h3>
          <p>{formatCurrency(totals.income)}</p>
        </article>
        <article className="card stat">
          <h3>Total Expense</h3>
          <p>{formatCurrency(totals.expense)}</p>
        </article>
        <article className="card stat">
          <h3>Net</h3>
          <p>{formatCurrency(totals.net)}</p>
        </article>
      </div>

      <div className="charts-grid">
        <article className="card chart-card">
          <h3>Income vs Expense Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="income" stroke="#2f855a" />
              <Line type="monotone" dataKey="expense" stroke="#e53e3e" />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className="card chart-card">
          <h3>Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.categoryBreakdown} dataKey="value" nameKey="name" outerRadius={90} fill="#3b82f6" />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="card chart-card full-width">
          <h3>Yearly Spending</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.yearly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </div>
    </section>
  );
}