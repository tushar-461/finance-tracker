import { useAuth } from "../hooks/useAuth";

export default function RoleGate({ allow, fallback = null, children }) {
  const { role } = useAuth();
  if (!allow.includes(role)) {
    return fallback;
  }
  return children;
}
