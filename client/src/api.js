const BASE_URL = process.env.REACT_APP_API_URL || "https://student-management-nani.onrender.com";
const API_URL = `${BASE_URL}/api/students`;

async function request(path = "", options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}

export const getStudents = () => request();

export const addStudent = (student) =>
    request("", {
        method: "POST",
        body: JSON.stringify(student),
    });

export const updateStudent = (id, student) =>
    request(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(student),
    });

export const deleteStudent = (id) =>
    request(`/${id}`, {
        method: "DELETE",
    });