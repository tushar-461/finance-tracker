import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ALL_ROLES } from "../constants/roles";

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: ALL_ROLES[1],
  });
  const [error, setError] = useState("");

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required.");
      return;
    }

    const result = await register(form);
    if (!result.ok) {
      setError(result.message || "Unable to register.");
      return;
    }

    navigate("/login", { replace: true });
  };

  return (
    <div className="auth-page">
      <form className="card" onSubmit={onSubmit}>
        <h1>Create account</h1>
        <label>
          Name
          <input value={form.name} onChange={(e) => update("name", e.target.value)} />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </label>
        <label>
          Role
          <select value={form.role} onChange={(e) => update("role", e.target.value)}>
            {ALL_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}