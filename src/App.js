import { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [editingId, setEditingId] = useState(null);

  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:3001/api/users");
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`http://localhost:3001/api/users/${editingId}`, form);
      setEditingId(null);
    } else {
      await axios.post("http://localhost:3001/api/users", form);
    }
    setForm({ name: "", email: "" });
    fetchUsers();
  };

  const handleEdit = (user) => {
    setForm({ name: user.name, email: user.email });
    setEditingId(user.id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3001/api/users/${id}`);
    fetchUsers();
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">🔧 使用者資料管理</h1>
      <form onSubmit={handleSubmit} className="space-y-2 mb-4">
        <input
          className="border p-2 w-full"
          placeholder="姓名"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="border p-2 w-full"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <button className="bg-blue-500 text-white p-2 rounded">
          {editingId ? "更新" : "新增"}
        </button>
      </form>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">姓名</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2 space-x-2">
                <button className="bg-yellow-400 p-1 px-2" onClick={() => handleEdit(user)}>編輯</button>
                <button className="bg-red-500 text-white p-1 px-2" onClick={() => handleDelete(user.id)}>刪除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
