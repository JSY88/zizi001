// quiz.js - 퀴즈 진행 로직

const QuizEngine = {
  currentQuiz: null,
  currentQuestionIndex: 0,
  userAnswers: {},
  showResult: false,
  allQuestions: [],

  // 퀴즈 시작
  startQuiz(quiz) {
    this.currentQuiz = quiz;
    this.currentQuestionIndex = 0;
    this.userAnswers = {};
    this.showResult = false;
    this.allQuestions = quiz.passages.flatMap(p => 
      p.questions.map(q => ({ ...q, passageText: p.text }))
    );
  },

  // 현재 문제 가져오기
  getCurrentQuestion() {
    if (!this.allQuestions.length) return null;
    return this.allQuestions[this.currentQuestionIndex];
  },

  // 답안 선택
  selectAnswer(optionIndex) {
    const question = this.getCurrentQuestion();
    if (!question) return;

    this.userAnswers[question.id] = optionIndex;
    this.showResult = true;
  },

  // 다음 문제
  nextQuestion() {
    if (this.currentQuestionIndex < this.allQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.showResult = false;
      return 'next';
    } else {
      return 'finish';
    }
  },

  // 퀴즈 완료 및 결과 저장
  finishQuiz() {
    const results = this.allQuestions.map(q => {
      const isCorrect = this.userAnswers[q.id] === q.correctAnswer;
      
      return {
        quizId: this.currentQuiz.id,
        quizTitle: this.currentQuiz.title,
        questionId: q.id,
        question: q.question,
        userAnswer: this.userAnswers[q.id],
        userAnswerText: q.options[this.userAnswers[q.id]] || '',
        correctAnswer: q.correctAnswer,
        correctAnswerText: q.options[q.correctAnswer],
        options: q.options,
        isCorrect: isCorrect,
        explanation: q.explanation,
        timestamp: new Date().toISOString(),
        consecutiveCorrect: 0 // 간격 반복용
      };
    });

    Storage.addResults(results);

    const correct = results.filter(r => r.isCorrect).length;
    const total = results.length;

    return {
      correct,
      total,
      percentage: Math.round((correct / total) * 100),
      results
    };
  },

  // 진행률
  getProgress() {
    if (!this.allQuestions.length) return 0;
    return Math.round(((this.currentQuestionIndex + 1) / this.allQuestions.length) * 100);
  },

  // 현재 상태
  getState() {
    return {
      quiz: this.currentQuiz,
      questionIndex: this.currentQuestionIndex,
      totalQuestions: this.allQuestions.length,
      question: this.getCurrentQuestion(),
      userAnswer: this.getCurrentQuestion() ? this.userAnswers[this.getCurrentQuestion().id] : undefined,
      showResult: this.showResult,
      progress: this.getProgress()
    };
  }
};