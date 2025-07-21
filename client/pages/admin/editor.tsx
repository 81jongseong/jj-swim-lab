import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function EditorPage() {
  const [markdown, setMarkdown] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [quiz, setQuiz] = useState({
    question: "",
    choices: ["", "", "", ""],
    answer: 0,
  });

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("markdown", markdown);
      if (image) formData.append("image", image);
      formData.append("quiz", JSON.stringify(quiz));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert("❌ 서버 오류: " + err.message);
        return;
      }

      const result = await res.json();
      alert("✅ 업로드 성공: ID = " + result.id);
      setMarkdown("");
      setImage(null);
      setQuiz({ question: "", choices: ["", "", "", ""], answer: 0 });
    } catch (err) {
      alert("❌ 클라이언트 오류: " + (err as Error).message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📝 콘텐츠 등록</h2>
      <textarea
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        rows={10}
        style={{ width: "100%" }}
        placeholder="Markdown 입력"
      />
      <input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} />
      <hr />
      <h3>🧠 퀴즈 등록</h3>
      <input
        value={quiz.question}
        onChange={(e) => setQuiz({ ...quiz, question: e.target.value })}
        placeholder="문제"
        style={{ width: "100%" }}
      />
      {quiz.choices.map((c, i) => (
        <div key={i}>
          <input
            value={c}
            onChange={(e) => {
              const newChoices = [...quiz.choices];
              newChoices[i] = e.target.value;
              setQuiz({ ...quiz, choices: newChoices });
            }}
            placeholder={`보기 ${i + 1}`}
            style={{ width: "80%" }}
          />
          <input
            type="radio"
            checked={quiz.answer === i}
            onChange={() => setQuiz({ ...quiz, answer: i })}
          />
          정답
        </div>
      ))}
      <button onClick={handleSubmit} style={{ marginTop: "1rem" }}>
        🔼 업로드
      </button>

      <div style={{ marginTop: "2rem", background: "#f3f3f3", padding: "1rem" }}>
        <h3>🔍 미리보기</h3>
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
