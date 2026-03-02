import { useCallback, useEffect, useMemo, useState } from "react";
import Pagination from "../components/Pagination";
import RoleGate from "../components/RoleGate";
import VirtualTransactionList from "../components/VirtualTransactionList";
import { getApiErrorMessage, transactionsApi } from "../api/client";
import { ROLES } from "../constants/roles";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency, toTitleCase } from "../utils/format";

const seedData = [
  { id: "1", date: "2026-01-04", type: "expense", category: "food", amount: 45, note: "Lunch" },
  { id: "2", date: "2026-01-05", type: "income", category: "salary", amount: 2200, note: "Monthly salary" },
  { id: "3", date: "2026-01-07", type: "expense", category: "transport", amount: 18, note: "Cab" },
  { id: "4", date: "2026-01-10", type: "expense", category: "entertainment", amount: 62, note: "Movie" },
  { id: "5", date: "2026-01-12", type: "expense", category: "food", amount: 30, note: "Dinner" },
  { id: "6", date: "2026-01-14", type: "income", category: "freelance", amount: 500, note: "Side project" },
  { id: "7", date: "2026-01-17", type: "expense", category: "utilities", amount: 96, note: "Electricity" },
  { id: "8", date: "2026-01-20", type: "expense", category: "transport", amount: 25, note: "Metro card" },
  { id: "9", date: "2026-01-23", type: "expense", category: "food", amount: 39, note: "Groceries" },
  { id: "10", date: "2026-01-26", type: "expense", category: "entertainment", amount: 28, note: "Streaming" },
];

const categories = ["all", "food", "transport", "entertainment", "utilities", "salary", "freelance"];

const initialForm = {
  date: "",
  type: "expense",
  category: "food",
  amount: "",
  note: "",
};

export default function TransactionsPage() {
  const { role } = useAuth();
  const canMutate = role === ROLES.ADMIN || role === ROLES.USER;

  const [transactions, setTransactions] = useState(seedData);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");

  const isEditing = Boolean(editingId);
  const useVirtualScroll = pageSize >= 25;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await transactionsApi.list();
        if (Array.isArray(response?.data)) {
          setTransactions(response.data);
          return;
        }
        throw new Error("Unexpected response for transactions.");
      } catch (err) {
        setError(getApiErrorMessage(err, "Using local demo transactions."));
        setTransactions(seedData);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((item) => {
      const queryText = query.toLowerCase();
      const matchText =
        item.note.toLowerCase().includes(queryText) ||
        item.category.toLowerCase().includes(queryText);
      const matchCategory = category === "all" || item.category === category;
      return matchText && matchCategory;
    });
  }, [transactions, query, category]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [query, category, pageSize]);

  const onChange = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetEditor = useCallback(() => {
    setForm(initialForm);
    setEditingId("");
  }, []);

  const onEditStart = useCallback((item) => {
    setEditingId(item.id);
    setForm({
      date: item.date,
      type: item.type,
      category: item.category,
      amount: String(item.amount),
      note: item.note,
    });
  }, []);

  const onSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (!canMutate) {
      return;
    }

    if (!form.date || !form.type || !form.category || !form.amount || !form.note) {
      setError("Please fill all transaction fields.");
      return;
    }

    setError("");

    const payload = {
      ...form,
      amount: Number(form.amount),
    };

    try {
      if (editingId) {
        await transactionsApi.update(editingId, payload);
        setTransactions((prev) =>
          prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item)),
        );
      } else {
        const created = {
          ...payload,
          id: crypto.randomUUID(),
        };
        await transactionsApi.create(created);
        setTransactions((prev) => [created, ...prev]);
      }
      resetEditor();
    } catch (err) {
      if (editingId) {
        setTransactions((prev) =>
          prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item)),
        );
      } else {
        setTransactions((prev) => [{ ...payload, id: crypto.randomUUID() }, ...prev]);
      }
      resetEditor();
      setError(getApiErrorMessage(err, "Saved locally due to API issue."));
    }
  }, [canMutate, editingId, form, resetEditor]);

  const onDelete = useCallback(async (id) => {
    if (!canMutate) {
      return;
    }

    try {
      await transactionsApi.remove(id);
    } catch {
      // Local delete fallback.
    }

    setTransactions((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      resetEditor();
    }
  }, [canMutate, editingId, resetEditor]);

  return (
    <section>
      <h1>Transactions</h1>

      <div className="card filters">
        <input
          placeholder="Search note or category"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((item) => (
            <option key={item} value={item}>
              {toTitleCase(item)}
            </option>
          ))}
        </select>
        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={25}>25 / page (virtual)</option>
          <option value={50}>50 / page (virtual)</option>
        </select>
      </div>

      <form className="card form-grid" onSubmit={onSubmit}>
        <h3>{isEditing ? "Edit Transaction" : "Add Transaction"}</h3>
        <input type="date" value={form.date} onChange={(e) => onChange("date", e.target.value)} disabled={!canMutate} />
        <select value={form.type} onChange={(e) => onChange("type", e.target.value)} disabled={!canMutate}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={form.category} onChange={(e) => onChange("category", e.target.value)} disabled={!canMutate}>
          {categories
            .filter((item) => item !== "all")
            .map((item) => (
              <option key={item} value={item}>
                {toTitleCase(item)}
              </option>
            ))}
        </select>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => onChange("amount", e.target.value)}
          disabled={!canMutate}
        />
        <input placeholder="Note" value={form.note} onChange={(e) => onChange("note", e.target.value)} disabled={!canMutate} />
        <RoleGate allow={[ROLES.ADMIN, ROLES.USER]}>
          <div className="row-actions">
            <button type="submit">{isEditing ? "Update" : "Add"}</button>
            {isEditing && (
              <button type="button" className="ghost" onClick={resetEditor}>
                Cancel
              </button>
            )}
          </div>
        </RoleGate>
        <RoleGate allow={[ROLES.READ_ONLY]}>
          <p className="muted">Read-only users cannot create, edit, or delete transactions.</p>
        </RoleGate>
      </form>

      {loading && <p className="muted">Loading transactions...</p>}
      {error && <p className="error">{error}</p>}

      <div className="card table-wrap">
        {!useVirtualScroll && (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Note</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{toTitleCase(item.type)}</td>
                  <td>{toTitleCase(item.category)}</td>
                  <td>{formatCurrency(item.amount)}</td>
                  <td>{item.note}</td>
                  <td className="row-actions">
                    <button onClick={() => onEditStart(item)} disabled={!canMutate}>
                      Edit
                    </button>
                    <button onClick={() => onDelete(item.id)} disabled={!canMutate}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!paginated.length && (
                <tr>
                  <td colSpan="6">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {useVirtualScroll && (
          <VirtualTransactionList
            data={paginated}
            onEdit={onEditStart}
            onDelete={onDelete}
            canMutate={canMutate}
          />
        )}
      </div>

      <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
    </section>
  );
}