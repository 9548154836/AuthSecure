
import { useState } from "react";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("Please wait...");
    setLoading(true);

    try {
      const endpoint = isLogin ? "login" : "register";

      const response = await fetch(
        `http://localhost:8080/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isLogin ? { email, password } : { name, email, password }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || data.error || "Request failed");
        return;
      }

      if (isLogin && data.token) {
        localStorage.setItem("token", data.token);
        await loadProfile(data.token);
      } else {
        setMessage("Registration successful! Now login.");
        setIsLogin(true);
        setPassword("");
      }
    } catch {
      setMessage("Backend connect nahi hua. Check port 8080.");
    } finally {
      setLoading(false);
    }
  }

  async function loadProfile(token) {
    try {
      const response = await fetch("http://localhost:8080/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem("token");
        setMessage("Login successful, but profile load nahi hua.");
        return;
      }

      const profile = await response.json();
      setUser(profile);
      setMessage("");
    } catch {
      setMessage("Profile load nahi hua. Backend check karo.");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    setPassword("");
    setMessage("You have been logged out.");
    setIsLogin(true);
  }

  return (
    <main className="page">
      <section className="auth-card">
        <div className="brand-icon">🔐</div>
        <h1>AuthSecure</h1>
        <p className="subtitle">
          Secure Authentication &amp; Access Management
        </p>

        {user ? (
          <div className="dashboard">
            <h2>Welcome, {user.name}!</h2>
            <p className="hint">You are successfully logged in.</p>

            <div className="user-details">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Status:</strong> Authenticated</p>
            </div>

            {user.role === "ADMIN" && (
              <button
                className="submit-btn"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");
                    const response = await fetch(
                      "http://localhost:8080/api/admin/dashboard",
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );

                    if (response.ok) {
                      const result = await response.json();
                      setMessage(result.message);
                    } else {
                      setMessage("Admin dashboard access denied.");
                    }
                  } catch {
                    setMessage("Admin request failed.");
                  }
                }}
              >
                Open Admin Dashboard
              </button>
            )}

            {message && <p className="message">{message}</p>}

            <button className="submit-btn logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        ) : (
          <>
            <div className="tabs">
              <button
                type="button"
                className={isLogin ? "tab active" : "tab"}
                onClick={() => {
                  setIsLogin(true);
                  setMessage("");
                }}
              >
                Login
              </button>

              <button
                type="button"
                className={!isLogin ? "tab active" : "tab"}
                onClick={() => {
                  setIsLogin(false);
                  setMessage("");
                }}
              >
                Register
              </button>
            </div>

            <h2>{isLogin ? "Welcome back!" : "Create account"}</h2>
            <p className="hint">
              {isLogin
                ? "Enter your account details to continue."
                : "Join us and secure your account."}
            </p>

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <label>
                  Full name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </label>
              )}

              <label>
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  minLength={8}
                  required
                />
              </label>

              <button className="submit-btn" type="submit" disabled={loading}>
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Sign In →"
                  : "Create Account →"}
              </button>
            </form>

            {message && <p className="message">{message}</p>}
          </>
        )}

        <p className="footer">Powered by Spring Boot &amp; JWT</p>
      </section>
    </main>
  );
}

export default App;
