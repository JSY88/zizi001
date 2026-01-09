// app.js - 메인 애플리케이션

class QuizFlowApp {
  constructor() {
    this.view = 'home';
    this.selectedSubject = null;
    this.selectedQuiz = null;
    this.reviewMode = null;
    this.settings = Storage.getSettings();
    this.init();
  }

  init() {
    this.applySettings();
    this.render();
  }

  applySettings() {
    document.documentElement.setAttribute('data-color-mode', this.settings.colorMode);
  }

  // 뷰 전환
  navigateTo(view, data = {}) {
    this.view = view;
    Object.assign(this, data);
    this.render();
  }

  // 렌더링
  render() {
    const app = document.getElementById('app');
    
    switch(this.view) {
      case 'home':
        app.innerHTML = this.renderHome();
        break;
      case 'quizList':
        app.innerHTML = this.renderQuizList();
        break;
      case 'quiz':
        app.innerHTML = this.renderQuiz();
        break;
      case 'result':
        app.innerHTML = this.renderResult();
        break;
      case 'review':
        app.innerHTML = this.renderReview();
        break;
      case 'reviewSelect':
        app.innerHTML = this.renderReviewSelect();
        break;
      case 'upload':
        app.innerHTML = this.renderUpload();
        break;
      case 'settings':
        app.innerHTML = this.renderSettings();
        break;
    }

    this.attachEventListeners();
  }

  // 홈 화면
  renderHome() {
    const stats = Storage.getStats();
    const wrongCount = Storage.getWrongResults().length;
    const allQuizzes = this.getAllQuizzes();

    return `
      <div class="max-w-4xl mx-auto">
        <!-- 헤더 -->
        <div class="bg-card p-6 rounded-lg shadow mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold mb-2">📚 QuizFlow</h1>
              <p class="text-secondary">학습 퀴즈 플랫폼</p>
            </div>
            <button onclick="app.navigateTo('settings')" class="btn btn-secondary">
              ⚙️ 설정
            </button>
          </div>
        </div>

        <!-- 통계 -->
        ${stats.total > 0 ? `
          <div class="bg-card p-6 rounded-lg shadow mb-6">
            <h2 class="text-xl font-bold mb-4">📊 학습 통계</h2>
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center p-4 bg-info rounded">
                <div class="text-3xl font-bold">${stats.total}</div>
                <div class="text-sm text-secondary">총 문제</div>
              </div>
              <div class="text-center p-4 bg-success rounded">
                <div class="text-3xl font-bold">${stats.correct}</div>
                <div class="text-sm text-secondary">정답</div>
              </div>
              <div class="text-center p-4 bg-info rounded">
                <div class="text-3xl font-bold">${stats.accuracy}%</div>
                <div class="text-sm text-secondary">정답률</div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 빠른 시작 -->
        <div class="bg-card p-6 rounded-lg shadow mb-6">
          <h2 class="text-xl font-bold mb-4">🎯 빠른 시작</h2>
          <div class="grid grid-cols-2 gap-4">
            <button 
              onclick="app.navigateTo('reviewSelect')" 
              ${wrongCount === 0 ? 'disabled' : ''}
              class="btn btn-primary p-4 rounded-lg ${wrongCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
            >
              🔄 복습하기 (${wrongCount})
            </button>
            <button onclick="app.navigateTo('upload')" class="btn btn-secondary p-4 rounded-lg">
              📤 CSV 업로드
            </button>
          </div>
        </div>

        <!-- 과목 선택 -->
        <div class="bg-card p-6 rounded-lg shadow">
          <h2 class="text-xl font-bold mb-4">📖 과목 선택</h2>
          <div class="space-y-4">
            ${SAMPLE_DATA.subjects.map(subject => {
              const quizCount = allQuizzes[subject.id]?.length || 0;
              return `
                <div onclick="app.navigateTo('quizList', { selectedSubject: '${subject.id}' })" 
                     class="border-2 border-custom p-4 rounded-lg cursor-pointer hover:border-gray-400 transition">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="text-3xl">${subject.icon}</span>
                      <div>
                        <h3 class="font-bold text-lg">${subject.name}</h3>
                        <p class="text-sm text-secondary">${quizCount} 퀴즈</p>
                      </div>
                    </div>
                    <div class="text-secondary">→</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 퀴즈 목록
  renderQuizList() {
    const quizzes = this.getAllQuizzes()[this.selectedSubject] || [];
    const subject = SAMPLE_DATA.subjects.find(s => s.id === this.selectedSubject);
    const results = Storage.getResults();

    return `
      <div class="max-w-4xl mx-auto">
        <button onclick="app.navigateTo('home')" class="mb-4 text-secondary hover:text-primary">
          ← 돌아가기
        </button>

        <div class="bg-card p-6 rounded-lg shadow mb-6">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-3xl">${subject.icon}</span>
            <h1 class="text-2xl font-bold">${subject.name}</h1>
          </div>
          <p class="text-secondary">${quizzes.length}개의 퀴즈</p>
        </div>

        <div class="space-y-4">
          ${quizzes.map(quiz => {
            const totalQuestions = quiz.passages.reduce((sum, p) => sum + p.questions.length, 0);
            const quizResults = results.filter(r => r.quizId === quiz.id);
            const attempted = quizResults.length;
            const correct = quizResults.filter(r => r.isCorrect).length;

            return `
              <div onclick="app.startQuiz('${quiz.id}')" 
                   class="bg-card p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="px-2 py-1 bg-info text-sm rounded">${quiz.level}</span>
                      <h3 class="font-bold text-lg">${quiz.title}</h3>
                    </div>
                    <p class="text-sm text-secondary mb-2">${totalQuestions} 문제</p>
                    ${attempted > 0 ? `
                      <div class="flex items-center gap-2 text-sm">
                        <span class="text-success">✓ ${correct}</span>
                        <span class="text-error">✗ ${attempted - correct}</span>
                        <span class="text-tertiary">(${Math.round((correct / attempted) * 100)}%)</span>
                      </div>
                    ` : ''}
                  </div>
                  <span class="text-2xl">📖</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // 퀴즈 화면
  renderQuiz() {
    const state = QuizEngine.getState();
    if (!state.question) return '<div>문제를 불러올 수 없습니다.</div>';

    const question = state.question;
    const isAnswered = state.userAnswer !== undefined;

    return `
      <div class="max-w-3xl mx-auto">
        <div class="mb-4 flex items-center justify-between">
          <button onclick="app.navigateTo('quizList', { selectedSubject: '${this.selectedSubject}' })" 
                  class="text-secondary hover:text-primary">
            ← 퀴즈 목록
          </button>
          <div class="text-sm text-secondary">
            문제 ${state.questionIndex + 1} / ${state.totalQuestions}
          </div>
        </div>

        <div class="bg-card p-6 rounded-lg shadow mb-6">
          <h2 class="text-xl font-bold mb-4">${state.quiz.title}</h2>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${state.progress}%"></div>
          </div>
        </div>

        ${question.passageText ? `
          <div class="bg-info p-6 rounded-lg mb-6">
            <h3 class="font-bold mb-2">📖 지문</h3>
            <p class="leading-relaxed whitespace-pre-line">${question.passageText}</p>
          </div>
        ` : ''}

        <div class="bg-card p-6 rounded-lg shadow">
          <h3 class="font-bold text-lg mb-4">${question.question}</h3>

          <div class="space-y-3 mb-6">
            ${question.options.map((option, index) => {
              const isSelected = state.userAnswer === index;
              const isCorrect = index === question.correctAnswer;
              const showCorrect = state.showResult && isCorrect;
              const showWrong = state.showResult && isSelected && !isCorrect;

              let btnClass = 'option-btn';
              let icon = '';
              
              if (showCorrect) {
                btnClass += ' correct';
                icon = ' ✓';
              } else if (showWrong) {
                btnClass += ' wrong';
                icon = ' ✗';
              } else if (isSelected) {
                btnClass += ' selected';
              }

              return `
                <button 
                  onclick="app.selectAnswer(${index})"
                  ${state.showResult ? 'disabled' : ''}
                  class="${btnClass} w-full p-4 text-left rounded-lg transition">
                  <div class="flex items-center justify-between">
                    <span>${option}</span>
                    ${icon ? `<span class="font-bold">${icon}</span>` : ''}
                  </div>
                </button>
              `;
            }).join('')}
          </div>

          ${state.showResult ? `
            <div class="${state.userAnswer === question.correctAnswer ? 'bg-success' : 'bg-error'} p-4 rounded-lg mb-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="font-bold">
                  ${state.userAnswer === question.correctAnswer ? '✓ 정답입니다!' : '✗ 틀렸습니다'}
                </span>
              </div>
              <p class="text-sm">${question.explanation}</p>
            </div>
          ` : ''}

          <button 
            onclick="app.nextQuestion()"
            ${!isAnswered ? 'disabled' : ''}
            class="btn btn-primary w-full ${!isAnswered ? 'opacity-50 cursor-not-allowed' : ''}">
            ${state.questionIndex < state.totalQuestions - 1 ? '다음 문제' : '퀴즈 완료'}
          </button>
        </div>
      </div>
    `;
  }

  // 결과 화면
  renderResult() {
    const result = this.quizResult;
    if (!result) return '';

    return `
      <div class="max-w-3xl mx-auto">
        <div class="bg-card p-8 rounded-lg shadow text-center">
          <div class="text-6xl mb-4">🏆</div>
          <h1 class="text-3xl font-bold mb-4">퀴즈 완료!</h1>
          
          <div class="mb-6">
            <div class="text-5xl font-bold mb-2">${result.percentage}%</div>
            <div class="text-secondary">${result.correct} / ${result.total} 정답</div>
          </div>

          <div class="flex gap-4 justify-center">
            <button onclick="app.restartQuiz()" class="btn btn-primary">
              다시 풀기
            </button>
            <button onclick="app.navigateTo('home')" class="btn btn-secondary">
              홈으로
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // 복습 모드 선택
  renderReviewSelect() {
    return `
      <div class="max-w-4xl mx-auto">
        <button onclick="app.navigateTo('home')" class="mb-4 text-secondary hover:text-primary">
          ← 홈으로
        </button>

        <div class="bg-card p-6 rounded-lg shadow mb-6">
          <h1 class="text-2xl font-bold mb-2">🔄 복습 모드 선택</h1>
          <p class="text-secondary">원하는 복습 방식을 선택하세요</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${Object.entries(ReviewManager.modes).map(([key, mode]) => {
            const stats = ReviewManager.getReviewStats(key);
            return `
              <div onclick="app.startReview('${key}')" 
                   class="bg-card p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition ${stats.total === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
                <div class="text-3xl mb-3">${mode.icon}</div>
                <h3 class="font-bold text-lg mb-2">${mode.name}</h3>
                <p class="text-sm text-secondary mb-3">${mode.description}</p>
                <div class="text-2xl font-bold">${stats.total}개</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // 복습 화면
  renderReview() {
    const results = ReviewManager.getReviewQuestions(this.reviewMode);
    const modeName = ReviewManager.modes[this.reviewMode]?.name || '복습';

    return `
      <div class="max-w-4xl mx-auto">
        <button onclick="app.navigateTo('reviewSelect')" class="mb-4 text-secondary hover:text-primary">
          ← 복습 모드 선택
        </button>

        <div class="bg-card p-6 rounded-lg shadow mb-6">
          <h1 class="text-2xl font-bold mb-2">🔄 ${modeName}</h1>
          <p class="text-secondary">${results.length}개의 문제</p>
        </div>

        <div class="space-y-4">
          ${results.map((result, index) => `
            <div class="bg-card p-6 rounded-lg shadow">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <span class="text-xs text-tertiary block mb-1">${result.quizTitle}</span>
                  <h3 class="font-bold mb-2">${result.question}</h3>
                  
                  ${result.options ? `
                    <div class="space-y-2 mb-3">
                      ${result.options.map((opt, i) => {
                        const isUserAnswer = i === result.userAnswer;
                        const isCorrect = i === result.correctAnswer;
                        return `
                          <div class="p-2 rounded text-sm ${isCorrect ? 'bg-success' : isUserAnswer ? 'bg-error' : 'bg-info'}">
                            ${i + 1}. ${opt} ${isCorrect ? '✓ 정답' : isUserAnswer ? '✗ 내 답' : ''}
                          </div>
                        `;
                      }).join('')}
                    </div>
                  ` : `
                    <div class="text-sm mb-3">
                      <div class="mb-1">
                        <span class="text-tertiary">내 답:</span> 
                        <span class="text-error">${result.userAnswerText || '선택 ' + (result.userAnswer + 1)}</span>
                      </div>
                      <div>
                        <span class="text-tertiary">정답:</span> 
                        <span class="text-success">${result.correctAnswerText || '선택 ' + (result.correctAnswer + 1)}</span>
                      </div>
                    </div>
                  `}

                  ${result.explanation ? `
                    <div class="text-sm text-secondary bg-info p-3 rounded">
                      💡 ${result.explanation}
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // CSV 업로드
  renderUpload() {
    return `
      <div class="max-w-4xl mx-auto">
        <button onclick="app.navigateTo('home')" class="mb-4 text-secondary hover:text-primary">
          ← 홈으로
        </button>

        <div class="bg-card p-6 rounded-lg shadow mb-6">
          <h1 class="text-2xl font-bold mb-4">📤 CSV 업로드</h1>
          
          <div class="mb-6">
            <label class="block text-sm font-bold mb-2">CSV 파일 선택:</label>
            <input type="file" id="csvFile" accept=".csv" class="w-full p-2 border-2 border-custom rounded">
          </div>

          <div class="mb-4 p-4 bg-info rounded">
            <h3 class="font-bold mb-2">📋 CSV 형식 예시:</h3>
            <pre class="text-xs overflow-x-auto whitespace-pre">Subject,Level,Title,PassageText,Question,Option1,Option2,Option3,Option4,CorrectAnswer,Explanation
english,a1,Test,"Sample text",What?,A,B,C,D,2,Explanation</pre>
          </div>

          <div class="flex gap-4">
            <button onclick="app.uploadCSV()" class="btn btn-primary flex-1">
              업로드하기
            </button>
            <button onclick="CSVParser.downloadTemplate()" class="btn btn-secondary">
              템플릿 다운로드
            </button>
          </div>

          <div id="uploadResult" class="mt-4"></div>
        </div>
      </div>
    `;
  }

  // 설정
  renderSettings() {
    return `
      <div class="max-w-4xl mx-auto">
        <button onclick="app.navigateTo('home')" class="mb-4 text-secondary hover:text-primary">
          ← 홈으로
        </button>

        <div class="bg-card p-6 rounded-lg shadow mb-6">
          <h1 class="text-2xl font-bold mb-4">⚙️ 설정</h1>
          
          <div class="space-y-6">
            <!-- 컬러 모드 -->
            <div>
              <h3 class="font-bold mb-3">🎨 화면 모드</h3>
              <div class="flex gap-4">
                <button 
                  onclick="app.setColorMode('bw')" 
                  class="btn ${this.settings.colorMode === 'bw' ? 'btn-primary' : 'btn-secondary'} flex-1">
                  흑백 모드
                </button>
                <button 
                  onclick="app.setColorMode('color')" 
                  class="btn ${this.settings.colorMode === 'color' ? 'btn-primary' : 'btn-secondary'} flex-1">
                  컬러 모드
                </button>
              </div>
            </div>

            <!-- 데이터 관리 -->
            <div>
              <h3 class="font-bold mb-3">🗂️ 데이터 관리</h3>
              <button onclick="app.exportData()" class="btn btn-secondary w-full mb-2">
                데이터 내보내기 (JSON)
              </button>
              <button onclick="app.clearData()" class="btn btn-secondary w-full">
                모든 데이터 삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 이벤트 리스너
  attachEventListeners() {
    // 필요시 추가 이벤트 리스너 등록
  }

  // 액션 메서드들
  getAllQuizzes() {
    const custom = Storage.getCustomQuizzes();
    const allQuizzes = { ...SAMPLE_DATA.quizzes };
    
    custom.forEach(quiz => {
      if (!allQuizzes[quiz.subject]) {
        allQuizzes[quiz.subject] = [];
      }
      allQuizzes[quiz.subject].push(quiz);
    });
    
    return allQuizzes;
  }

  startQuiz(quizId) {
    const allQuizzes = this.getAllQuizzes();
    let quiz = null;
    
    for (const subject in allQuizzes) {
      quiz = allQuizzes[subject].find(q => q.id === quizId);
      if (quiz) break;
    }
    
    if (quiz) {
      QuizEngine.startQuiz(quiz);
      this.selectedQuiz = quiz;
      this.navigateTo('quiz');
    }
  }

  selectAnswer(index) {
    QuizEngine.selectAnswer(index);
    this.render();
  }

  nextQuestion() {
    const action = QuizEngine.nextQuestion();
    if (action === 'finish') {
      this.quizResult = QuizEngine.finishQuiz();
      this.navigateTo('result');
    } else {
      this.render();
    }
  }

  restartQuiz() {
    if (this.selectedQuiz) {
      this.startQuiz(this.selectedQuiz.id);
    }
  }

  startReview(mode) {
    const stats = ReviewManager.getReviewStats(mode);
    if (stats.total === 0) return;
    
    this.reviewMode = mode;
    this.navigateTo('review');
  }

  async uploadCSV() {
    const fileInput = document.getElementById('csvFile');
    const resultDiv = document.getElementById('uploadResult');
    
    if (!fileInput.files[0]) {
      resultDiv.innerHTML = '<div class="p-4 bg-error rounded">파일을 선택해주세요.</div>';
      return;
    }

    try {
      const quizzes = await CSVParser.parseFile(fileInput.files[0]);
      
      quizzes.forEach(quiz => Storage.addCustomQuiz(quiz));
      
      resultDiv.innerHTML = `
        <div class="p-4 bg-success rounded">
          <div class="font-bold mb-2">✓ 업로드 완료!</div>
          <div class="text-sm">${quizzes.length}개의 퀴즈가 추가되었습니다.</div>
        </div>
      `;
      
      setTimeout(() => this.navigateTo('home'), 2000);
    } catch (error) {
      resultDiv.innerHTML = `
        <div class="p-4 bg-error rounded">
          <div class="font-bold mb-2">✗ 오류 발생</div>
          <div class="text-sm">${error.message}</div>
        </div>
      `;
    }
  }

  setColorMode(mode) {
    this.settings.colorMode = mode;
    Storage.saveSettings(this.settings);
    this.applySettings();
    this.render();
  }

  exportData() {
    const data = {
      results: Storage.getResults(),
      customQuizzes: Storage.getCustomQuizzes(),
      settings: this.settings,
      exportDate: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `quizflow-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  clearData() {
    if (Storage.clearAll()) {
      alert('데이터가 삭제되었습니다.');
      this.navigateTo('home');
    }
  }
}

// 앱 시작
const app = new QuizFlowApp();