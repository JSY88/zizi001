// app.js - 메인 애플리케이션

class QuizFlowApp {
  constructor() {
    this.view = 'home';
    this.selectedSubject = null;
    this.selectedQuiz = null;
    this.reviewMode = null;
    this.uploadTab = 'file'; // 기본값: 파일 업로드 탭
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
      case 'manageSubjects':
        app.innerHTML = this.renderManageSubjects();
        break;
    }

    this.attachEventListeners();
  }

  // 홈 화면
  renderHome() {
    const stats = Storage.getStats();
    const wrongCount = Storage.getWrongResults().length;
    const allQuizzes = this.getAllQuizzes();
    const allSubjects = this.getAllSubjects();

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
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">📖 과목 선택</h2>
            <button onclick="app.navigateTo('manageSubjects')" class="btn btn-secondary text-sm">
              ⚙️ 과목 관리
            </button>
          </div>
          <div class="space-y-4">
            ${allSubjects.map(subject => {
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
            
            ${allSubjects.length === 0 ? `
              <div class="text-center p-8 text-secondary">
                <p class="mb-4">아직 과목이 없습니다.</p>
                <button onclick="app.navigateTo('manageSubjects')" class="btn btn-primary">
                  첫 과목 추가하기
                </button>
              </div>
            ` : ''}
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
          
          <!-- 탭 선택 -->
          <div class="flex gap-2 mb-6 border-b-2 border-custom">
            <button 
              onclick="app.setUploadTab('file')" 
              id="tab-file"
              class="px-4 py-2 font-bold border-b-2 -mb-0.5">
              📁 파일 업로드
            </button>
            <button 
              onclick="app.setUploadTab('text')" 
              id="tab-text"
              class="px-4 py-2 font-bold border-b-2 -mb-0.5 border-transparent">
              📝 텍스트 입력
            </button>
          </div>

          <!-- 파일 업로드 탭 -->
          <div id="upload-file" style="display: block;">
            <div class="mb-6">
              <label class="block text-sm font-bold mb-2">CSV 파일 선택:</label>
              <input type="file" id="csvFile" accept=".csv" class="w-full p-2 border-2 border-custom rounded">
            </div>

            <div class="flex gap-4">
              <button onclick="app.uploadCSVFile()" class="btn btn-primary flex-1">
                파일 업로드
              </button>
              <button onclick="app.downloadTemplate()" class="btn btn-secondary">
                템플릿 다운로드
              </button>
            </div>
          </div>

          <!-- 텍스트 입력 탭 -->
          <div id="upload-text" style="display: none;">
            <div class="mb-4">
              <label class="block text-sm font-bold mb-2">과목 선택 (옵션):</label>
              <select id="uploadSubject" class="w-full p-2 border-2 border-custom rounded mb-4">
                <option value="">자동 감지 (CSV의 Subject 필드 사용)</option>
                ${this.getAllSubjects().map(s => 
                  `<option value="${s.id}">${s.icon} ${s.name}</option>`
                ).join('')}
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-bold mb-2">CSV 텍스트 입력 또는 붙여넣기:</label>
              <textarea 
                id="csvText" 
                class="w-full h-64 p-4 border-2 border-custom rounded font-mono text-sm"
                placeholder="Subject,Level,Title,PassageText,Question,Option1,Option2,Option3,Option4,CorrectAnswer,Explanation
english,a1,Test,&quot;Sample text&quot;,What is this?,A,B,C,D,2,Explanation here"></textarea>
            </div>

            <div class="flex gap-4">
              <button onclick="app.uploadCSVText()" class="btn btn-primary flex-1">
                텍스트 업로드
              </button>
              <button onclick="app.clearCSVText()" class="btn btn-secondary">
                내용 지우기
              </button>
            </div>
          </div>

          <!-- 형식 예시 -->
          <div class="mt-6 p-4 bg-info rounded">
            <h3 class="font-bold mb-2">📋 CSV 형식 예시:</h3>
            <pre class="text-xs overflow-x-auto whitespace-pre">Subject,Level,Title,PassageText,Question,Option1,Option2,Option3,Option4,CorrectAnswer,Explanation
english,a1,Test,"Sample text",What?,A,B,C,D,2,Explanation</pre>
          </div>

          <div id="uploadResult" class="mt-4"></div>
        </div>
      </div>
    `;
  }

  // 과목 관리 화면
  renderManageSubjects() {
    const allSubjects = this.getAllSubjects();
    const customSubjects = Storage.getCustomSubjects();

    return `
      <div class="max-w-4xl mx-auto">
        <button onclick="app.navigateTo('home')" class="mb-4 text-secondary hover:text-primary">
          ← 홈으로
        </button>

        <div class="bg-card p-6 rounded-lg shadow mb-6">
          <h1 class="text-2xl font-bold mb-4">⚙️ 과목 관리</h1>
          
          <!-- 새 과목 추가 -->
          <div class="mb-6 p-4 bg-info rounded">
            <h3 class="font-bold mb-3">➕ 새 과목 추가</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input 
                type="text" 
                id="newSubjectId" 
                placeholder="과목 ID (예: math, korean)"
                class="p-2 border-2 border-custom rounded"
              />
              <input 
                type="text" 
                id="newSubjectName" 
                placeholder="과목 이름 (예: 수학)"
                class="p-2 border-2 border-custom rounded"
              />
              <input 
                type="text" 
                id="newSubjectIcon" 
                placeholder="아이콘 (예: 🔢)"
                class="p-2 border-2 border-custom rounded"
              />
            </div>
            <button onclick="app.addSubject()" class="btn btn-primary w-full mt-3">
              과목 추가
            </button>
          </div>

          <!-- 기존 과목 목록 -->
          <div>
            <h3 class="font-bold mb-3">📚 현재 과목 목록</h3>
            <div class="space-y-3">
              ${allSubjects.map(subject => {
                const isBuiltIn = SAMPLE_DATA.subjects.some(s => s.id === subject.id);
                const quizCount = this.getAllQuizzes()[subject.id]?.length || 0;
                
                return `
                  <div class="border-2 border-custom p-4 rounded-lg">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <span class="text-3xl">${subject.icon}</span>
                        <div>
                          <h4 class="font-bold">${subject.name}</h4>
                          <p class="text-sm text-secondary">
                            ID: ${subject.id} | ${quizCount} 퀴즈
                            ${isBuiltIn ? ' | 기본 과목' : ''}
                          </p>
                        </div>
                      </div>
                      ${!isBuiltIn ? `
                        <button 
                          onclick="app.deleteSubject('${subject.id}')"
                          class="btn btn-secondary text-sm">
                          🗑️ 삭제
                        </button>
                      ` : `
                        <span class="text-xs text-tertiary">삭제 불가</span>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div id="subjectManageResult"></div>
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
  getAllSubjects() {
    const builtIn = SAMPLE_DATA.subjects;
    const custom = Storage.getCustomSubjects();
    
    // 중복 제거 (ID 기준)
    const subjectMap = new Map();
    builtIn.forEach(s => subjectMap.set(s.id, s));
    custom.forEach(s => subjectMap.set(s.id, s));
    
    return Array.from(subjectMap.values());
  }

  getAllQuizzes() {
    const custom = Storage.getCustomQuizzes();
    const allQuizzes = {};
    
    // 기본 퀴즈 복사
    Object.keys(SAMPLE_DATA.quizzes).forEach(subject => {
      allQuizzes[subject] = [...SAMPLE_DATA.quizzes[subject]];
    });
    
    // 커스텀 퀴즈 추가
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

  // CSV 업로드 관련 메서드들
  setUploadTab(tab) {
    this.uploadTab = tab;
    
    // 탭 버튼 스타일
    document.getElementById('tab-file').className = 
      tab === 'file' 
        ? 'px-4 py-2 font-bold border-b-2 -mb-0.5 border-black'
        : 'px-4 py-2 font-bold border-b-2 -mb-0.5 border-transparent';
    
    document.getElementById('tab-text').className = 
      tab === 'text' 
        ? 'px-4 py-2 font-bold border-b-2 -mb-0.5 border-black'
        : 'px-4 py-2 font-bold border-b-2 -mb-0.5 border-transparent';
    
    // 탭 컨텐츠 표시
    document.getElementById('upload-file').style.display = tab === 'file' ? 'block' : 'none';
    document.getElementById('upload-text').style.display = tab === 'text' ? 'block' : 'none';
  }

  async uploadCSVFile() {
    const fileInput = document.getElementById('csvFile');
    const resultDiv = document.getElementById('uploadResult');
    
    if (!fileInput.files[0]) {
      resultDiv.innerHTML = '<div class="p-4 bg-error rounded">파일을 선택해주세요.</div>';
      return;
    }

    try {
      const quizzes = await this.parseCSVFile(fileInput.files[0]);
      
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

  async uploadCSVText() {
    const textArea = document.getElementById('csvText');
    const subjectSelect = document.getElementById('uploadSubject');
    const resultDiv = document.getElementById('uploadResult');
    const overrideSubject = subjectSelect?.value || null;
    
    if (!textArea.value.trim()) {
      resultDiv.innerHTML = '<div class="p-4 bg-error rounded">CSV 텍스트를 입력해주세요.</div>';
      return;
    }

    try {
      const quizzes = this.parseCSVText(textArea.value);
      
      // 과목 선택 시 모든 퀴즈의 subject 덮어쓰기
      if (overrideSubject) {
        quizzes.forEach(quiz => {
          quiz.subject = overrideSubject;
        });
      }
      
      // 과목이 존재하지 않으면 자동 추가
      quizzes.forEach(quiz => {
        const allSubjects = this.getAllSubjects();
        if (!allSubjects.some(s => s.id === quiz.subject)) {
          Storage.addCustomSubject({
            id: quiz.subject,
            name: quiz.subject.charAt(0).toUpperCase() + quiz.subject.slice(1),
            icon: '📁'
          });
        }
      });
      
      quizzes.forEach(quiz => Storage.addCustomQuiz(quiz));
      
      resultDiv.innerHTML = `
        <div class="p-4 bg-success rounded">
          <div class="font-bold mb-2">✓ 업로드 완료!</div>
          <div class="text-sm">${quizzes.length}개의 퀴즈가 추가되었습니다.</div>
        </div>
      `;
      
      textArea.value = '';
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

  clearCSVText() {
    document.getElementById('csvText').value = '';
    document.getElementById('uploadResult').innerHTML = '';
  }

  downloadTemplate() {
    const template = `Subject,Level,Title,PassageText,Question,Option1,Option2,Option3,Option4,CorrectAnswer,Explanation
english,a1,Sample Quiz,"This is a sample passage text. You can leave this empty for questions without passages.",What is this?,Answer A,Answer B,Answer C,Answer D,2,This explains why B is correct
english,a1,Sample Quiz,,Another question?,Option 1,Option 2,Option 3,Option 4,1,Explanation for question 2
math,basic,Math Quiz,,What is 1+1?,1,2,3,4,2,1+1 equals 2`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // CSV 파싱 메서드들
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);

    return result.map(field => field.replace(/^"|"$/g, ''));
  }

  parseCSVText(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV 파일이 비어있거나 형식이 잘못되었습니다.');
    }

    const headers = this.parseCSVLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = this.parseCSVLine(lines[i]);
        const row = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index] ? values[index].trim() : '';
        });
        rows.push(row);
      }
    }

    return this.rowsToQuizzes(rows);
  }

  async parseCSVFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csvText = event.target.result;
          const quizzes = this.parseCSVText(csvText);
          resolve(quizzes);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  rowsToQuizzes(rows) {
    const quizMap = new Map();

    rows.forEach((row, index) => {
      try {
        const subject = row.Subject || 'general';
        const level = row.Level || 'basic';
        const title = row.Title || `Quiz ${index + 1}`;
        const passageText = row.PassageText || row.Passage || null;
        
        // Title별로 퀴즈를 구분 (더 이상 subject+level+title이 아님)
        const quizKey = `${subject}_${level}_${title}`;
        
        if (!quizMap.has(quizKey)) {
          quizMap.set(quizKey, {
            id: `csv-${subject}-${level}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            subject,
            level,
            title,
            source: 'csv',
            passages: []
          });
        }

        const quiz = quizMap.get(quizKey);
        
        // 같은 지문끼리 그룹화
        let passage = quiz.passages.find(p => p.text === passageText);
        if (!passage) {
          passage = {
            id: `p${quiz.passages.length + 1}`,
            text: passageText,
            questions: []
          };
          quiz.passages.push(passage);
        }

        const question = {
          id: `q${passage.questions.length + 1}`,
          question: row.Question || '',
          options: [
            row.Option1 || row.A || '',
            row.Option2 || row.B || '',
            row.Option3 || row.C || '',
            row.Option4 || row.D || ''
          ].filter(opt => opt),
          correctAnswer: parseInt(row.CorrectAnswer || row.Answer || '1') - 1,
          explanation: row.Explanation || ''
        };

        if (!question.question) {
          throw new Error(`행 ${index + 1}: 문제가 비어있습니다.`);
        }
        if (question.options.length < 2) {
          throw new Error(`행 ${index + 1}: 최소 2개의 선택지가 필요합니다.`);
        }
        if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
          throw new Error(`행 ${index + 1}: 정답 번호가 유효하지 않습니다.`);
        }

        passage.questions.push(question);
      } catch (error) {
        console.error(`행 ${index + 1} 처리 중 오류:`, error);
        throw error;
      }
    });

    return Array.from(quizMap.values());
  }

  async uploadCSV() {
    // 레거시 메서드 - 호환성 유지
    await this.uploadCSVFile();
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

  // 과목 관리 메서드들
  addSubject() {
    const id = document.getElementById('newSubjectId').value.trim().toLowerCase();
    const name = document.getElementById('newSubjectName').value.trim();
    const icon = document.getElementById('newSubjectIcon').value.trim();
    const resultDiv = document.getElementById('subjectManageResult');

    if (!id || !name) {
      resultDiv.innerHTML = '<div class="p-4 bg-error rounded">과목 ID와 이름을 모두 입력해주세요.</div>';
      return;
    }

    // ID 중복 체크
    const allSubjects = this.getAllSubjects();
    if (allSubjects.some(s => s.id === id)) {
      resultDiv.innerHTML = '<div class="p-4 bg-error rounded">이미 존재하는 과목 ID입니다.</div>';
      return;
    }

    // ID 형식 체크 (영문, 숫자, 하이픈, 언더스코어만)
    if (!/^[a-z0-9_-]+$/.test(id)) {
      resultDiv.innerHTML = '<div class="p-4 bg-error rounded">과목 ID는 영문 소문자, 숫자, -, _만 사용 가능합니다.</div>';
      return;
    }

    Storage.addCustomSubject({
      id: id,
      name: name,
      icon: icon || '📁'
    });

    resultDiv.innerHTML = '<div class="p-4 bg-success rounded">✓ 과목이 추가되었습니다.</div>';
    
    setTimeout(() => {
      resultDiv.innerHTML = '';
      this.render();
    }, 1500);
  }

  deleteSubject(subjectId) {
    // 기본 과목은 삭제 불가
    if (SAMPLE_DATA.subjects.some(s => s.id === subjectId)) {
      alert('기본 과목은 삭제할 수 없습니다.');
      return;
    }

    // 퀴즈가 있는지 확인
    const quizzes = this.getAllQuizzes()[subjectId] || [];
    const customQuizzes = quizzes.filter(q => q.source === 'csv');
    
    if (customQuizzes.length > 0) {
      if (!confirm(`이 과목에는 ${customQuizzes.length}개의 퀴즈가 있습니다.\n과목과 퀴즈를 모두 삭제하시겠습니까?`)) {
        return;
      }
      
      // 해당 과목의 퀴즈도 함께 삭제
      Storage.deleteQuizzesBySubject(subjectId);
    }

    Storage.deleteCustomSubject(subjectId);
    
    const resultDiv = document.getElementById('subjectManageResult');
    resultDiv.innerHTML = '<div class="p-4 bg-success rounded">✓ 과목이 삭제되었습니다.</div>';
    
    setTimeout(() => {
      resultDiv.innerHTML = '';
      this.render();
    }, 1500);
  }

  deleteQuiz(quizId) {
    if (!confirm('이 퀴즈를 삭제하시겠습니까?')) {
      return;
    }

    Storage.deleteCustomQuiz(quizId);
    this.render();
  }
}

// 앱 시작
const app = new QuizFlowApp();
