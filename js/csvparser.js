// csvParser.js - CSV 파싱 및 JSON 변환

const CSVParser = {
  // CSV 텍스트를 파싱
  parseCSV(csvText) {
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

    return rows;
  },

  // CSV 한 줄 파싱 (따옴표 처리)
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
  },

  // CSV 행들을 퀴즈 JSON으로 변환
  rowsToQuizzes(rows) {
    const quizMap = new Map();

    rows.forEach((row, index) => {
      try {
        const subject = row.Subject || 'general';
        const level = row.Level || 'basic';
        const title = row.Title || `Quiz ${index + 1}`;
        const passageText = row.PassageText || row.Passage || null;
        
        const quizKey = `${subject}_${level}_${title}`;
        
        if (!quizMap.has(quizKey)) {
          quizMap.set(quizKey, {
            id: `csv-${subject}-${level}-${Date.now()}-${index}`,
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

        // 문제 추가
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

        // 검증
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
  },

  // CSV 파일에서 퀴즈 생성
  async parseFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csvText = event.target.result;
          const rows = this.parseCSV(csvText);
          const quizzes = this.rowsToQuizzes(rows);
          resolve(quizzes);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsText(file, 'UTF-8');
    });
  },

  // 퀴즈를 JSON 파일로 다운로드
  downloadJSON(quiz, filename) {
    const json = JSON.stringify(quiz, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `quiz-${quiz.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // CSV 템플릿 다운로드
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
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // 여러 퀴즈를 하나의 JSON 파일로 다운로드
  downloadAllQuizzes(quizzes, filename = 'quizzes-export.json') {
    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      quizzes: quizzes
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};