// review.js - 복습 모드 관리

const ReviewManager = {
  modes: {
    'wrong-only': {
      name: '틀린 문제만',
      description: '지금까지 틀린 모든 문제',
      icon: '❌',
      getResults: () => Storage.getWrongResults()
    },
    'low-accuracy': {
      name: '정답률 낮은 문제',
      description: '정답률 50% 미만 문제',
      icon: '📉',
      getResults: () => Storage.getResultsByAccuracy(0, 0.5)
    },
    'medium-accuracy': {
      name: '정답률 중간 문제',
      description: '정답률 50-80% 문제',
      icon: '📊',
      getResults: () => Storage.getResultsByAccuracy(0.5, 0.8)
    },
    'spaced-repetition': {
      name: '간격 반복 복습',
      description: '복습 주기가 된 문제',
      icon: '🔄',
      getResults: () => Storage.getSpacedRepetitionResults()
    }
  },

  // 복습할 문제 목록 가져오기
  getReviewQuestions(mode) {
    const modeConfig = this.modes[mode];
    if (!modeConfig) return [];
    
    return modeConfig.getResults();
  },

  // 결과를 퀴즈 형식으로 변환
  resultsToQuizFormat(results, allQuizzes) {
    // 결과에서 원본 퀴즈 정보 찾기
    const questions = results.map(result => {
      // 모든 퀴즈에서 해당 문제 찾기
      for (const subject in allQuizzes) {
        for (const quiz of allQuizzes[subject]) {
          if (quiz.id === result.quizId) {
            for (const passage of quiz.passages) {
              const question = passage.questions.find(q => q.id === result.questionId);
              if (question) {
                return {
                  ...question,
                  quizId: quiz.id,
                  quizTitle: quiz.title,
                  passageText: passage.text,
                  result: result
                };
              }
            }
          }
        }
      }
      return null;
    }).filter(q => q !== null);

    return questions;
  },

  // 복습 통계
  getReviewStats(mode) {
    const results = this.getReviewQuestions(mode);
    const uniqueQuestions = new Set(results.map(r => `${r.quizId}_${r.questionId}`));
    
    return {
      total: uniqueQuestions.size,
      results: results
    };
  }
};