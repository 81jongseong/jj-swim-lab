import { useState } from "react";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("회원가입 실패");

      const data = await res.json();
      alert(`가입 완료: ${data.message}`);
    } catch (err) {
      console.error(err);
      alert("가입 중 오류 발생");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-6">회원가입</h1>
        <form
          onSubmit={handleSubmit}
          className="flex space-x-2 text-white"
        >
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={form.name}
            onChange={handleChange}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
}
