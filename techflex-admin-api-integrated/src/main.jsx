import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  Mail,
  Phone,
  Search,
  Trash2,
  Eye,
  LogOut,
  Lock,
  User,
  RefreshCw,
  MessageCircle,
  CheckCircle2,
  Clock3,
  XCircle,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  Send,
  Filter,
  Building2,
} from "lucide-react";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = {
  async login(payload) {
    return request("/api/admin/login", {
      method: "POST",
      body: payload,
    });
  },

  async forgotPassword(payload) {
    return request("/api/admin/forgot-password", {
      method: "POST",
      body: payload,
    });
  },

  async verifyOtp(payload) {
    return request("/api/admin/verify-otp", {
      method: "POST",
      body: payload,
    });
  },

  async resetPassword(payload) {
    return request("/api/admin/reset-password", {
      method: "POST",
      body: payload,
    });
  },

  async getContacts() {
    return request("/api/contact");
  },

  async updateStatus(id, status) {
    return request(`/api/contact/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },

  async deleteContact(id) {
    return request(`/api/contact/${id}`, {
      method: "DELETE",
    });
  },
};

async function request(path, options = {}) {
  const token = localStorage.getItem("techflex_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

function App() {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem("techflex_admin");
    return saved ? JSON.parse(saved) : null;
  });
  const [authView, setAuthView] = useState("login");

  if (!admin) {
    return (
      <AuthLayout
        authView={authView}
        setAuthView={setAuthView}
        onLogin={(data) => {
          localStorage.setItem("techflex_token", data.token);
          localStorage.setItem("techflex_admin", JSON.stringify(data.admin));
          setAdmin(data.admin);
        }}
      />
    );
  }

  return (
    <Dashboard
      admin={admin}
      onLogout={() => {
        localStorage.removeItem("techflex_token");
        localStorage.removeItem("techflex_admin");
        setAdmin(null);
        setAuthView("login");
      }}
    />
  );
}

function AuthLayout({ authView, setAuthView, onLogin }) {
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-mark">♻</div>
        <h1>TECHFLEX PLASTO</h1>
        <p>Private Limited</p>
      </div>

      <div className="auth-card">
        {authView === "login" && (
          <LoginForm onLogin={onLogin} onForgot={() => setAuthView("forgot")} />
        )}

        {authView === "forgot" && (
          <ForgotPasswordFlow onBack={() => setAuthView("login")} />
        )}
      </div>
    </div>
  );
}

function LoginForm({ onLogin, onForgot }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      const data = await api.login({
        email: form.email.trim(),
        password: form.password,
      });
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-heading">
        <ShieldCheck size={32} />
        <div>
          <h2>Admin Login</h2>
          <p>Manage Techflex contact inquiries securely.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-stack">
        <label>
          <span>Email</span>
          <div className="input-icon">
            <Mail size={18} />
            <input
              type="email"
              placeholder="admin email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </label>

        <label>
          <span>Password</span>
          <div className="input-icon">
            <Lock size={18} />
            <input
              type="password"
              placeholder="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </label>

        {error && <div className="error-box">{error}</div>}

        <button className="primary-btn" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>

        <button type="button" className="link-btn" onClick={onForgot}>
          Forgot Password?
        </button>
      </form>
    </>
  );
}

function ForgotPasswordFlow({ onBack }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const clearAlerts = () => {
    setMessage("");
    setError("");
  };

  const sendOtp = async (event) => {
    event.preventDefault();
    clearAlerts();

    if (!email.trim()) {
      setError("Please enter admin email.");
      return;
    }

    try {
      setLoading(true);
      const data = await api.forgotPassword({ email: email.trim() });
      setMessage(data.message || "OTP sent successfully.");
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    clearAlerts();

    if (!otp.trim()) {
      setError("Please enter OTP.");
      return;
    }

    try {
      setLoading(true);
      const data = await api.verifyOtp({ otp: otp.trim() });
      setMessage(data.message || "OTP verified successfully.");
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    clearAlerts();

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const data = await api.resetPassword({
        otp: otp.trim(),
        newPassword,
      });
      setMessage(data.message || "Password reset successfully.");
      setTimeout(onBack, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" className="back-btn" onClick={onBack}>
        <ArrowLeft size={16} />
        Back to login
      </button>

      <div className="auth-heading">
        <KeyRound size={32} />
        <div>
          <h2>Forgot Password</h2>
          <p>Reset admin password using email OTP.</p>
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={sendOtp} className="form-stack">
          <label>
            <span>Admin Email</span>
            <div className="input-icon">
              <Mail size={18} />
              <input
                type="email"
                placeholder="registered admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </label>
          <button className="primary-btn" disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={verifyOtp} className="form-stack">
          <label>
            <span>OTP</span>
            <div className="input-icon">
              <Send size={18} />
              <input
                type="text"
                placeholder="6 digit OTP"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </label>
          <button className="primary-btn" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={resetPassword} className="form-stack">
          <label>
            <span>New Password</span>
            <div className="input-icon">
              <Lock size={18} />
              <input
                type="password"
                placeholder="new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </label>
          <button className="primary-btn" disabled={loading}>
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      )}

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}
    </>
  );
}

function Dashboard({ admin, onLogout }) {
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await api.getContacts();
      setContacts(data.data || []);
    } catch (err) {
      setNotice(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const stats = useMemo(() => {
    return {
      total: contacts.length,
      new: contacts.filter((item) => item.status === "New").length,
      contacted: contacts.filter((item) => item.status === "Contacted").length,
      closed: contacts.filter((item) => item.status === "Closed").length,
    };
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((item) => {
      const matchesStatus = status === "All" || item.status === status;
      const query = search.toLowerCase();
      const matchesSearch =
        item.name?.toLowerCase().includes(query) ||
        item.company?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        item.phone?.toLowerCase().includes(query) ||
        item.interest?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [contacts, search, status]);

  const updateStatus = async (id, nextStatus) => {
    try {
      await api.updateStatus(id, nextStatus);
      await loadContacts();
      setNotice("Status updated successfully.");
    } catch (err) {
      setNotice(err.message);
    }
  };

  const deleteInquiry = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this inquiry?");
    if (!ok) return;

    try {
      await api.deleteContact(id);
      setSelected(null);
      await loadContacts();
      setNotice("Inquiry deleted successfully.");
    } catch (err) {
      setNotice(err.message);
    }
  };

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="brand-mark small">♻</div>
          <div>
            <h2>TECHFLEX</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav>
          <button className="nav-item active">
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button className="nav-item active-soft">
            <Mail size={18} />
            Inquiries
          </button>
        </nav>

        <div className="sidebar-footer">
          <p>Logged in as</p>
          <strong>{admin?.name || "Techflex Admin"}</strong>
          <span>{admin?.email}</span>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Inquiry Management</p>
            <h1>Techflex Admin Dashboard</h1>
          </div>

          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </header>

        {notice && (
          <div className="notice">
            {notice}
            <button onClick={() => setNotice("")}>×</button>
          </div>
        )}

        <section className="stats-grid">
          <StatCard title="Total Inquiries" value={stats.total} icon={<Mail />} />
          <StatCard title="New" value={stats.new} icon={<Clock3 />} />
          <StatCard title="Contacted" value={stats.contacted} icon={<CheckCircle2 />} />
          <StatCard title="Closed" value={stats.closed} icon={<XCircle />} />
        </section>

        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>Contact Inquiries</h2>
              <p>Manage website form submissions from customers.</p>
            </div>
            <button className="secondary-btn" onClick={loadContacts}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="toolbar">
            <div className="search-box">
              <Search size={18} />
              <input
                placeholder="Search name, email, phone, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-box">
              <Filter size={18} />
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="All">All Status</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading inquiries...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="empty-state">No inquiries found.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Company</th>
                    <th>Interest</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="customer-cell">
                          <div className="avatar">{item.name?.charAt(0) || "U"}</div>
                          <div>
                            <strong>{item.name}</strong>
                            <span>{item.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{item.company || "-"}</td>
                      <td>{item.interest || "-"}</td>
                      <td>{item.phone}</td>
                      <td>
                        <select
                          className={`status-select ${item.status?.toLowerCase()}`}
                          value={item.status || "New"}
                          onChange={(e) => updateStatus(item._id, e.target.value)}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td>{formatDate(item.createdAt)}</td>
                      <td>
                        <div className="action-row">
                          <button onClick={() => setSelected(item)} title="View">
                            <Eye size={16} />
                          </button>
                          <a href={`tel:${item.phone}`} title="Call">
                            <Phone size={16} />
                          </a>
                          <a
                            href={`https://wa.me/91${item.phone}?text=Hello ${encodeURIComponent(
                              item.name || ""
                            )}, thank you for contacting Techflex Plasto.`}
                            target="_blank"
                            rel="noreferrer"
                            title="WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </a>
                          <button onClick={() => deleteInquiry(item._id)} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {selected && (
        <InquiryModal
          inquiry={selected}
          onClose={() => setSelected(null)}
          onDelete={() => deleteInquiry(selected._id)}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  );
}

function InquiryModal({ inquiry, onClose, onDelete }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Inquiry Details</p>
            <h2>{inquiry.name}</h2>
          </div>
          <button onClick={onClose}>×</button>
        </div>

        <div className="detail-grid">
          <Detail label="Company" value={inquiry.company || "-"} icon={<Building2 />} />
          <Detail label="Email" value={inquiry.email} icon={<Mail />} />
          <Detail label="Phone" value={inquiry.phone} icon={<Phone />} />
          <Detail label="Interest" value={inquiry.interest || "-"} icon={<User />} />
        </div>

        <div className="message-box">
          <span>Message</span>
          <p>{inquiry.message}</p>
        </div>

        <div className="modal-actions">
          <a className="secondary-btn" href={`mailto:${inquiry.email}`}>
            <Mail size={16} />
            Email
          </a>
          <a className="secondary-btn" href={`tel:${inquiry.phone}`}>
            <Phone size={16} />
            Call
          </a>
          <button className="danger-btn" onClick={onDelete}>
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, icon }) {
  return (
    <div className="detail-item">
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

createRoot(document.getElementById("root")).render(<App />);
