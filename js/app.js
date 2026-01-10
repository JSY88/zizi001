// app.js - 메인 애플리케이션 (완전 재작성)

class QuizFlowApp {
  constructor() {
    this.view = 'home';
    this.selectedSubject = null;
    this.selectedFolder = null;
    this.selectedQuiz = null;
    this.reviewMode = null;
    this.reviewQuestions = [];
    this.uploadTab = 'file';
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

  navigateTo(view, data = {}) {
    this.view = view;
    Object.assign(this, data);
    this.render();
  }

  render() {
    const app = document.getElementById('app');
    
    switch(this.view) {
      case 'home':
        app.innerHTML = this.renderHome();
        break;
      case 'subject':
        app.innerHTML = this.renderSubject();
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
      case 'reviewQuiz':
        app.innerHTML = this.renderReviewQuiz();
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
    const subjects = Storage.getAllSubjects();

    return `
      <div class="max-w-4xl mx-auto">
        <div class="bg-card p-6 rounded-lg shadow mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold mb-2">📚 QuizFlow</h1>
              <p class="text-secondary">학습 퀴즈 플랫폼</p>
            </div>
            <button onclick="app.navigateTo('settings')" class="btn btn-secondary">⚙️ 설정</button>
          </div>
        </div>

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

        <div class="bg-card p-6 rounded-lg shadow mb-6">
          <h2 class="text-xl font-bold mb-4">🎯 빠른 시작</h2>
          <div class="grid grid-cols-2 gap-4">
            <button onclick="app.navigateTo('reviewSelect')" ${wrongCount === 0 ? 'disabled' : ''}
              class="btn btn-primary p-4 rounded-lg ${wrongCount === 0 ? 'opacity-50' : ''}">
              🔄 틀린 문제 복습 (${wrongCount})
            </button>
            <button onclick="app.navigateTo('upload')" class="btn btn-secondary p-4 rounded-lg">
              📤 CSV 업로드
            </button>
          </div>
        </div>

        <div class="bg-card p-6 rounded-lg shadow">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">📖 과목 선택</h2>
            <button onclick="app.navigateTo('manageSubjects')" class="btn btn-secondary text-sm">⚙️ 과목 관리</button>
          </div>
          <div class="space-y-4">
            ${subjects.map(subject => {
              const folderCount = Storage.getFolders(subject.id).length;
              const quizCount = Storage.getQuizzes(subject.id, null).length;
              return `
                <div onclick="app.navigateTo('subject', { selectedSubject: '${subject.id}' })" 
                     class="border-2 border-custom p-4 rounded-lg cursor-pointer hover:border-gray-400 transition">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="text-3xl">${subject.icon}</span>
                      <div>
                        <h3 class="font-bold text-lg">${subject.name}</h3>
                        <p class="text-sm text-secondary">${folderCount}개 폴더, ${quizCount}개 퀴즈</p>
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

  // 과목 화면 (폴더 목록)
  renderSubject() {
    const subject = Storage.getAllSubjects().find(s => s.id === this.selectedSubject);
    const folders = Storage.getFolders(this.selectedSubject);
    const rootQuizzes = Storage.getQuizzes(this.selectedSubject, null);

    return `
      <div class="max-w-4xl mx-auto">
        <button onclick="app.navigateTo('home')" class="mb-4 text-secondary hover:text-primary">← 홈으로</button>

        <div class="bg-card p-6 rounded-lg shadow mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-3xl">${subject.icon}</span>
              <h1 class="text-2xl font-bold">${subject.name}</h1>
            </div>
            <button onclick="app.showAddFolder('${this.selectedSubject}')" class="btn btn-secondary text-sm">
              ➕ 폴더 추가
            </button>
          </div>
        </div>

        ${folders.length > 0 ? `
          <div class="bg-card p-6 rounded-lg shadow mb-6">
            <h3 class="font-bold mb-3">📁 폴더</h3>
            <div class="space-y-3">
              ${folders.map(folder => {
                const quizCount = Storage.getQuizzes(this.selectedSubject, folder.id).length;
                return `
                  <div class="border-2 border-custom p-4 rounded-lg">
                    <div class="flex items-center justify-between">
                      <div class="flex-1 cursor-pointer" onclick="app.navigateTo('quizList', { selectedSubject: '${this.selectedSubject}', selectedFolder: '${folder.id}' })">
                        <h4 class="font-bold">📁 ${folder.name}</h4>
                        <p class="text-sm text-secondary">${quizCount}개 퀴즈</p>
                      </div>
                      <div class="flex gap-2">
                        <button onclick="app.editFolder('${this.selectedSubject}', '${folder.id}')" class="text-sm">✏️</button>
                        <button onclick="app.deleteFolder('${this.selectedSubject}', '${folder.id}')" class="text-sm">🗑️</button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        ${rootQuizzes.length > 0 ? `
          <div class="bg-card p-6 rounded-lg shadow">
            <h3 class="font-bold mb-3">📝 루트 퀴즈</h3>
            ${this.renderQuizItems(rootQuizzes)}
          </div>
        ` : ''}

        <div id="folderAction" class="mt-4"></div>
      </div>
    `;
  }

  // 퀴즈 목록
  renderQuizList() {
    const subject = Storage.getAllSubjects().find(s => s.id === this.selectedSubject);
    const folder = this.selectedFolder ? Storage.getFolder(this.selectedSubject, this.selectedFolder) : null;
    const quizzes = Storage.getQuizzes(this.selectedSubject, this.selectedFolder);

    return `
      <div class="max-w-4xl mx-auto">
        <button onclick="app.navigateTo('subject', { selectedSubject: '${this.selectedSubject}' })" 
                class="mb-4 text-secondary hover:text-primary">← 뒤로가기</button>

        <div class="bg-card p-6 rounded-lg shadow mb-6">
          <div class="flex items-center gap-3">
            <span class="text-3xl">${subject.icon}</span>
            <div class="flex-1">
              <h1 class="text-2xl font-bold">${subject.name} ${folder ? `/ ${folder.name}` : ''}</h1>
              <p class="text-secondary">${quizzes.length}개 퀴즈</p>
            </div>
            ${folder ? `
              <div class="flex gap-2">
                <button onclick="app.editFolder('${this.selectedSubject}', '${folder.id}')" class="btn btn-secondary text-sm">✏️ 수정</button>
                <button onclick="app.deleteFolder('${this.selectedSubject}', '${folder.id}')" class="btn btn-secondary text-sm">🗑️ 삭제</button>
              </div>
            ` : ''}
          </div>
        </div>

        ${quizzes.length > 0 ? `
          <div class="bg-card p-6 rounded-lg shadow">
            ${this.renderQuizItems(quizzes)}
          </div>
        ` : `
          <div class="bg-card p-8 rounded-lg shadow text-center">
            <p class="text-secondary mb-4">퀴즈가 없습니다.</p>
            <button onclick="app.navigateTo('upload')" class="btn btn-primary">퀴즈 추가하기</button>
          </div>
        `}

        <div id="quizAction" class="mt-4"></div>
      </div>
    `;
  }

  renderQuizItems(quizzes) {
    const results = Storage.getResults();
    
    return `
      <div class="space-y-4">
        ${quizzes.map(quiz => {
          const totalQuestions = quiz.passages.reduce((sum, p) => sum + p.questions.length, 0);
          const quizResults = results.filter(r => r.quizId === quiz.id);
          const wrongResults = quizResults.filter(r => !r.isCorrect);
          const attempted = quizResults.length;
          const correct = quizResults.filter(r => r.isCorrect).length;

          return `
            <div class="border-2 border-custom p-4 rounded-lg">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 cursor-pointer" onclick="app.startQuiz('${quiz.id}')">
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
                <div class="flex gap-2">
                  <button onclick="app.startQuiz('${quiz.id}')" class="btn btn-primary text-sm">📖 풀기</button>
                  ${wrongResults.length > 0 ? `
                    <button onclick="app.startQuizReview('${quiz.id}')" class="btn btn-secondary text-sm">🔄 복습 (${wrongResults.length})</button>
                  ` : ''}
                  <button onclick="app.editQuiz('${quiz.id}')" class="btn btn-secondary text-sm">✏️</button>
                  <button onclick="app.deleteQuiz('${quiz.id}')" class="btn btn-secondary text-sm">🗑️</button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // 퀴즈 풀기
  renderQuiz() {
    const state = QuizEngine.getState();
    if (!state.question) return '<div>문제를 불러올 수 없습니다.</div>';

    const question = state.question;
    const isAnswered = state.userAnswer !== undefined;

    return `
      <div class="max-w-3xl mx-auto">
        <div class="mb-4 flex items-center justify-between">
          <button onclick="app.navigateTo('quizList', { selectedSubject: '${this.selectedSubject}', selectedFolder: '${this.selectedFolder}' })" 
                  class="text-secondary hover:text-primary">← 퀴즈 목록</button>
          <div class="text-sm text-secondary">문제 ${state.questionIndex + 1} / ${state.totalQuestions}</div>
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
                <button onclick="app.selectAnswer(${index})" ${state.showResult ? 'disabled' : ''}
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
                <span class="font-bold">${state.userAnswer === question.correctAnswer ? '✓ 정답입니다!' : '✗ 틀렸습니다'}</span>
              </div>
              <p class="text-sm">${question.explanation}</p>
            </div>
          ` : ''}

          <button onclick="app.nextQuestion()" ${!isAnswered ? 'disabled' : ''}
            class="btn btn-primary w-full ${!isAnswered ? 'opacity-50' : ''}">
            ${state.questionIndex < state.totalQuestions - 1 ? '다음 문제' : '퀴즈 완료'}
          </button>
        </div>
      </div>
    `;
  }

  // 복습 퀴즈 (오답만)
  renderReviewQuiz() {
    const state = QuizEngine.getState();
    if (!state.question) return '<div>복습할 문제가 없습니다.</div>';

    const question = state.question;
    const isAnswered = state.userAnswer !== undefined;

    return `
      <div class="max-w-3xl mx-auto">
        <div class="mb-4 flex items-center justify-between">
          <button onclick="app.navigateTo('quizList', { selectedSubject: '${this.selectedSubject}', selectedFolder: '${this.selectedFolder}' })" 
                  class="text-secondary hover:text-primary">← 퀴즈 목록</button>
          <div class="text-sm text-secondary">
            복습 문제 ${state.questionIndex + 1} / ${state.totalQuestions}
          </div>
        </div>

        <div class="bg-card p-6 rounded-lg shadow mb-6">
          <h2 class="text-xl font-bold mb-2">🔄 ${state.quiz.title} - 복습 모드</h2>
          <p class="text-sm text-secondary mb-4">틀린 문제만 다시 풀기</p>
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
                <button onclick="app.selectAnswer(${index})" ${state.showResult ? 'disabled' : ''}
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
                <span class="font-bold">${state.userAnswer === question.correctAnswer ? '✓ 정답입니다!' : '✗ 다시 틀렸습니다'}</span>
              </div>
              <p class="text-sm">${question.explanation}</p>
            </div>
          ` : ''}

          <button onclick="app.nextQuestion()" ${!isAnswered ? 'disabled' : ''}
            class="btn btn-primary w-full ${!isAnswered ? 'opacity-50' : ''}">
            ${state.questionIndex < state.totalQuestions - 1 ? '다음 문제' : '복습 완료'}
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
            <button onclick="app.restartQuiz()" class="btn btn-primary">다시 풀기</button>
            <button onclick="app.navigateTo('quizList', { selectedSubject: '${this.selectedSubject}', selectedFolder: '${this.selectedFolder}' })" 
                    class="btn btn-secondary">퀴즈 목록</button>
          </div>
        </div>
      </div>
    `;
  }

  // 복습 모드 선택
  renderReviewSelect() {
    const wrongCount = Storage.getWrongResults().length;

    return `
      <div class="max-w-4xl mx-auto">
        <button onclick="app.navigateTo('home')" class="mb-4 text-secondary hover:text-primary">← 홈으로</button>

        <div class="bg-card p-6 rounded-lg shadow mb-6">
          <h1 class="text-2xl font-bold mb-2">🔄 전체 복습</h1>
          <p class="text-secondary">지금까지 틀린 모든 문제를 복습합니다</p>
        </div>

        ${wrongCount > 0 ? `
          <div class="bg-card p-6 rounded-lg shadow">
            <div class="mb-4">
              <div class="text-3xl font-bold mb-2">${wrongCount}개</div>
              <p class="text-secondary">복습할 문제가 있습니다</p>
            </div>
            <button onclick="app.startGlobalReview()" class="btn btn-primary w-full">
              🔄 틀린 문제 복습 시작
            </button>
          </div>
        ` : `
          <div class="bg-card p-8 rounded-lg shadow text-center">
            <p class="text-secondary mb-4">복습할 문제가 없습니다!</p>
            <button onclick="app.navigateTo('home')" class="btn btn-primary">홈으로</button>
          </div>
        `}
      </div>
    `;
  }

  // CSV 업로드
  renderUpload() {
    const subjects = Storage.getAllSubjects();

    return `
      <div class="max-w-4xl mx-auto">
        <button onclick="app.navigateTo('home')" class="mb-4 text-secondary hover:text-primary">← 홈으로</button>

        <div class="bg-card p-6 rounded-lg shadow mb-6">
          <h1 class="text-2xl font-bold mb-4">📤 CSV 업로드</h1>
          
          <div class="flex gap-2 mb-6 border-b-2 border-custom">
            <button onclick="app.setUploadTab('file')" id="tab-file" class="px-4 py-2 font-bold border-b-2 -mb-0.5">📁 파일</button>
            <button onclick="app.setUploadTab('text')" id="tab-text" class="px-4 py-2 font-bold border-b-2 -mb-0.5 border-transparent">📝 텍스트</button>
          </div>

          <div id="upload-file" style="display: block;">
            <div class="mb-6">
              <label class="block text-sm font-bold mb-2">CSV 파일:</label>
              <input type="file" id="csvFile" accept=".csv" class="w-full p-2 border-2 border-custom rounded">
            </div>
            <button onclick="app.uploadCSVFile()" class="btn btn-primary w-full">파일 업로드</button>
          </div>

          <div id="upload-text" style="display: none;">
            <div class="mb-4">
              <label class="block text-sm font-bold mb-2">과목 선택:</label>
              <select id="uploadSubject" class="w-full p-2 border-2 border-custom rounded">
                <option value="">자동 감지 (CSV Subject 사용)</option>
                ${subjects.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join('')}
              </select>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-bold mb-2">폴더 선택 (옵션):</label>
              <select id="uploadFolder" class="w-full p-2 border-2 border-custom rounded">
                <option value="">루트 (폴더 없음)</option>
              </select>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-bold mb-2">CSV 텍스트:</label>
              <textarea id="csvText" class="w-full h-64 p-4 border-2 border-custom rounded font-mono text-sm"
                placeholder="Subject,Level,Title,PassageText,Question,Option1,Option2,Option3,Option4,CorrectAnswer,Explanation"></textarea>
            </div>
            <div class="flex gap-4">
              <button onclick="app.uploadCSVText()" class="btn btn-primary flex-1">텍스트 업로드</button>
              <button onclick="app.clearCSVText()" class="btn btn-secondary">내용 지우기</button>
            </div>
          </div>

          <div class="mt-6 p-4 bg-info rounded">
            <h3 class="font-bold mb-2">📋 CSV 형식:</h3>
            <pre class="text-xs overflow-x-auto">Subject,Level,Title,PassageText,Question,Option1,Option2,Option3,Option4,CorrectAnswer,Explanation
english,a1,Test,"Sample",What?,A,B,C,D,2,Explanation</pre>
          </div>

          <div id="uploadResult" class="mt-4"></div>
        </div>
      </div>
    `;
  }

  // 과목 관리
  renderManageSubjects() {
    const subjects = Storage.getAllSubjects();

    return `
      <div class="max-w-4xl mx-auto">
        <button onclick="app.navigateTo('home')" class="mb-4 text-secondary hover:text-primary">← 홈으로</button>

        <div class="bg-card p-6 rounded-lg shadow mb-6">
          <h1 class="text-2xl font-bold mb-4">⚙️ 과목 관리</h1>
          
          <div class="mb-6 p-4 bg-info rounded">
            <h3 class="font-bold mb-3">➕ 새 과목 추가</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" id="newSubjectId" placeholder="과목 ID (영문)" class="p-2 border-2 border-custom rounded"/>
              <input type="text" id="newSubjectName" placeholder="과목 이름" class="p-2 border-2 border-custom rounded"/>
              <input type="text" id="newSubjectIcon" placeholder="아이콘 (예: 📚)" class="p-2 border-2 border-custom rounded"/>
            </div>
            <button onclick="app.addSubject()" class="btn btn-primary w-full
