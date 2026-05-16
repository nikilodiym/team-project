export function apiFormToEditor(form) {
  return {
    title: form.title || "Форма без назви",
    description: form.description || "",
    thumbnailUrl: form.thumbnailUrl || null,
    questions: (form.questions || []).map((q) => {
      const options = (q.options || []).sort((a, b) => a.orderIndex - b.orderIndex);
      const correctAnswers = options
        .map((o, idx) => (o.isCorrect ? idx : -1))
        .filter((idx) => idx >= 0);

      return {
        title: q.title,
        type: q.type,
        options: options.map((o) => o.optionText),
        correctAnswers,
      };
    }),
  };
}

export function editorToApiPayload(title, description, questions) {
  return {
    title: title || "Форма без назви",
    description: description || null,
    isPublic: true,
    allowMultipleSubmissions: true,
    showCorrectAnswers: false,
    collectEmail: true,
    questions: questions.map((q, qi) => ({
      title: q.title,
      type: q.type,
      orderIndex: qi,
      isRequired: false,
      options: (q.options || []).map((opt, oi) => ({
        optionText: opt,
        orderIndex: oi,
        isCorrect: (q.correctAnswers || []).includes(oi),
      })),
    })),
  };
}

export const defaultQuestion = () => ({
  title: "",
  type: "radio",
  options: ["Варіант 1"],
  correctAnswers: [],
});
