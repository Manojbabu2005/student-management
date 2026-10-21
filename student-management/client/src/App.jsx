
import { useEffect, useState } from "react";
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "./api";
import "./App.css";

const emptyForm = {
  name: "",
  rollNo: "",
  department: "CSE",
  email: "",
};

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadStudents() {
    setLoading(true);
    setError("");

    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      setError(`Could not load students: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditing(null);
  }

  async function saveStudent(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (editing) {
        await updateStudent(editing, form);
        setMessage("Student updated successfully!");
      } else {
        await addStudent(form);
        setMessage("Student added successfully!");
      }

      resetForm();
      await loadStudents();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function editStudent(student) {
    setEditing(student._id);
    setForm({
      name: student.name,
      rollNo: student.rollNo,
      department: student.department,
      email: student.email,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removeStudent(id) {
    if (!window.confirm("Delete this student record permanently?")) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await deleteStudent(id);
      setMessage("Student deleted successfully!");

      if (editing === id) resetForm();

      await loadStudents();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.rollNo} ${student.department} ${student.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const departmentCount = new Set(
    students.map((student) => student.department)
  ).size;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <span>
            Student<span className="brand-light">Hub</span>
          </span>
        </div>

        <p className="nav-label">MAIN MENU</p>
        <div className="nav-item active">▦ &nbsp; Dashboard</div>
        <div className="nav-item">♙ &nbsp; Students</div>

        <div className="sidebar-bottom">
          <div className="avatar">A</div>
          <div>
            <strong>Administrator</strong>
            <small>Student Manager</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">OVERVIEW</span>
            <h1>Student Dashboard</h1>
            <p>Manage your student records in one place.</p>
          </div>
          <div className="date-chip">✦ &nbsp; Academic Records</div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">♙</div>
            <p>Total Students</p>
            <h2>{students.length}</h2>
            <small>Saved student records</small>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">▤</div>
            <p>Departments</p>
            <h2>{departmentCount}</h2>
            <small>Departments represented</small>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <p>Database</p>
            <h2 className="status-text">
              {loading ? "Loading" : error ? "Check" : "Connected"}
            </h2>
            <small>Student records API</small>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>{editing ? "Update Student" : "Add New Student"}</h2>
              <p>Enter the student's basic information.</p>
            </div>

            {editing && (
              <button
                type="button"
                className="btn btn-light"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={saveStudent} className="student-form">
            <label>
              Full Name
              <input
                required
                maxLength={100}
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="Enter student name"
              />
            </label>

            <label>
              Roll Number
              <input
                required
                maxLength={30}
                value={form.rollNo}
                onChange={(e) =>
                  setForm({ ...form, rollNo: e.target.value })
                }
                placeholder="e.g. 23CS004"
              />
            </label>

            <label>
              Department
              <select
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
              >
                <option value="CSE">Computer Science</option>
                <option value="IT">Information Technology</option>
                <option value="ECE">Electronics</option>
                <option value="EEE">Electrical</option>
                <option value="MECH">Mechanical</option>
                <option value="CIVIL">Civil</option>
              </select>
            </label>

            <label>
              Email Address
              <input
                type="email"
                required
                maxLength={150}
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder="student@example.com"
              />
            </label>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={resetForm}
                disabled={saving}
              >
                Clear
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "+ Add Student"}
              </button>
            </div>
          </form>
        </section>

        {message && (
          <div className="toast" role="status">
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {error && (
          <div className="toast error-toast" role="alert">
            {error}
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        <section className="panel table-panel">
          <div className="panel-heading table-heading">
            <div>
              <h2>Student Records</h2>
              <p>Manage records saved in your database.</p>
            </div>

            <input
              className="search-input"
              placeholder="⌕  Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>ROLL NUMBER</th>
                  <th>DEPARTMENT</th>
                  <th>EMAIL</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      Loading student records...
                    </td>
                  </tr>
                ) : filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <div className="student-cell">
                        <div className="student-avatar">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <strong>{student.name}</strong>
                      </div>
                    </td>
                    <td>{student.rollNo}</td>
                    <td>
                      <span className="dept-badge">
                        {student.department}
                      </span>
                    </td>
                    <td>{student.email}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="icon-btn edit-btn"
                          title="Edit student"
                          onClick={() => editStudent(student)}
                        >
                          ✎
                        </button>
                        <button
                          className="icon-btn delete-btn"
                          title="Delete student"
                          onClick={() => removeStudent(student._id)}
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      {search
                        ? "No matching students found."
                        : "No students yet. Add your first student above."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </section>

        <footer>StudentHub · Student Management System</footer>
      </main>
    </div>
  );
}

export default App;
