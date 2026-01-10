// storage.js - localStorage 관리

const Storage = {
  // 설정
  getSettings() {
    const defaults = {
      colorMode: 'bw', // 'bw' or 'color'
    };
    const saved = localStorage.getItem('quizflow_settings');
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  },

  saveSettings(settings) {
    localStorage.setItem('quizflow_settings', JSON.stringify(settings));
  },

  // 퀴즈 결과
  getResults() {
    const saved = localStorage.getItem('quizflow_results');
    return saved ? JSON.parse(saved) : [];
  },

  saveResults(results) {
    localStorage.setItem('quizflow_results', JSON.stringify(results));
  },

  addResult(result) {
    const results = this.getResults();
    results.push(result);
    this.saveResults(results);
  },

  addResults(newResults) {
    const results = this.getResults();
    results.push(...newResults);
    this.saveResults(results);
  },

  // 틀린 문제 가져오기
  getWrongResults() {
    return this.getResults().filter(r => !r.isCorrect);
  },

  // 정답률별 필터링
  getResultsByAccuracy(minAccuracy, maxAccuracy) {
    const results = this.getResults();
    const questionStats = {};

    // 문제별 정답률 계산
    results.forEach(r => {
      const key = `${r.quizId}_${r.questionId}`;
      if (!questionStats[key]) {
        questionStats[key] = { total: 0, correct: 0, results: [] };
      }
      questionStats[key].total++;
      if (r.isCorrect) questionStats[key].correct++;
      questionStats[key].results.push(r);
    });

    // 정답률이 범위 내인 문제만 반환
    const filtered = [];
    Object.values(questionStats).forEach(stat => {
      const accuracy = stat.correct / stat.total;
      if (accuracy >= minAccuracy && accuracy <= maxAccuracy) {
        filtered.push(...stat.results);
      }
    });

    return filtered;
  },

  // 간격 반복 - 다음 복습 필요한 문제
  getSpacedRepetitionResults() {
    const results = this.getResults();
    const questionMap = new Map();

    // 최근 시도 기록만 저장
    results.forEach(r => {
      const key = `${r.quizId}_${r.questionId}`;
      const existing = questionMap.get(key);
      
      if (!existing || new Date(r.timestamp) > new Date(existing.timestamp)) {
        questionMap.set(key, r);
      }
    });

    // 간격 계산
    const now = Date.now();
    const needsReview = [];

    questionMap.forEach(r => {
      const daysSince = (now - new Date(r.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      
      // 간격 반복 알고리즘 (간단 버전)
      let interval = 1; // 기본 1일
      if (r.consecutiveCorrect >= 1) interval = 3;
      if (r.consecutiveCorrect >= 2) interval = 7;
      if (r.consecutiveCorrect >= 3) interval = 14;
      
      if (daysSince >= interval) {
        needsReview.push(r);
      }
    });

    return needsReview;
  },

  // 통계
  getStats() {
    const results = this.getResults();
    const total = results.length;
    const correct = results.filter(r => r.isCorrect).length;
    
    return {
      total,
      correct,
      wrong: total - correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0
    };
  },

  // 커스텀 퀴즈
  getCustomQuizzes() {
    const saved = localStorage.getItem('quizflow_custom_quizzes');
    return saved ? JSON.parse(saved) : [];
  },

  saveCustomQuizzes(quizzes) {
    localStorage.setItem('quizflow_custom_quizzes', JSON.stringify(quizzes));
  },

  addCustomQuiz(quiz) {
    const quizzes = this.getCustomQuizzes();
    quizzes.push(quiz);
    this.saveCustomQuizzes(quizzes);
  },

  deleteCustomQuiz(quizId) {
    const quizzes = this.getCustomQuizzes();
    const filtered = quizzes.filter(q => q.id !== quizId);
    this.saveCustomQuizzes(filtered);
  },

  deleteQuizzesBySubject(subjectId) {
    const quizzes = this.getCustomQuizzes();
    const filtered = quizzes.filter(q => q.subject !== subjectId);
    this.saveCustomQuizzes(filtered);
  },

  // 커스텀 과목
  getCustomSubjects() {
    const saved = localStorage.getItem('quizflow_custom_subjects');
    return saved ? JSON.parse(saved) : [];
  },

  saveCustomSubjects(subjects) {
    localStorage.setItem('quizflow_custom_subjects', JSON.stringify(subjects));
  },

  addCustomSubject(subject) {
    const subjects = this.getCustomSubjects();
    // 중복 체크
    if (!subjects.some(s => s.id === subject.id)) {
      subjects.push(subject);
      this.saveCustomSubjects(subjects);
    }
  },

  deleteCustomSubject(subjectId) {
    const subjects = this.getCustomSubjects();
    const filtered = subjects.filter(s => s.id !== subjectId);
    this.saveCustomSubjects(filtered);
  },

  // 데이터 초기화
  clearAll() {
    if (confirm('모든 데이터를 삭제하시겠습니까? (복구 불가능)')) {
      localStorage.removeItem('quizflow_results');
      localStorage.removeItem('quizflow_custom_quizzes');
      localStorage.removeItem('quizflow_custom_subjects');
      return true;
    }
    return false;
  }
};
