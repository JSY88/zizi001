// data.js - 샘플 퀴즈 데이터

const SAMPLE_DATA = {
  subjects: [
    { id: 'english', name: 'English', icon: '🇬🇧' },
    { id: 'math', name: 'Math', icon: '🔢' }
  ],
  quizzes: {
    english: [
      {
        id: 'eng-a1-001',
        title: "Emma's Family",
        level: 'A1',
        passages: [
          {
            id: 'p1',
            text: "My name is Emma. I am a student. I am 16 years old. I live in Seoul with my family. My family is small. I have one brother. His name is Tom. He is 12 years old. We have a dog. The dog's name is Max. Max is very cute. I like Max.",
            questions: [
              {
                id: 'q1',
                question: 'How old is Emma?',
                options: ['12 years old', '16 years old', '10 years old', '20 years old'],
                correctAnswer: 1,
                explanation: "The text says 'I am 16 years old.'"
              },
              {
                id: 'q2',
                question: 'Who is Tom?',
                options: ["Emma's father", "Emma's dog", "Emma's brother", "Emma's friend"],
                correctAnswer: 2,
                explanation: "Tom is Emma's brother."
              },
              {
                id: 'q3',
                question: 'What is Max?',
                options: ['A cat', 'A dog', 'A bird', 'A fish'],
                correctAnswer: 1,
                explanation: "The text says 'We have a dog. The dog's name is Max.'"
              }
            ]
          }
        ]
      },
      {
        id: 'eng-a1-002',
        title: "Daily Routine",
        level: 'A1',
        passages: [
          {
            id: 'p1',
            text: "I wake up at 7 AM every day. I eat breakfast at 7:30 AM. I go to school at 8 AM. School starts at 8:30 AM. I have lunch at 12 PM. School ends at 3 PM. I go home at 3:30 PM.",
            questions: [
              {
                id: 'q1',
                question: 'What time does the student wake up?',
                options: ['6 AM', '7 AM', '8 AM', '9 AM'],
                correctAnswer: 1,
                explanation: "The text says 'I wake up at 7 AM every day.'"
              },
              {
                id: 'q2',
                question: 'When does school start?',
                options: ['8:00 AM', '8:30 AM', '9:00 AM', '7:30 AM'],
                correctAnswer: 1,
                explanation: "The text says 'School starts at 8:30 AM.'"
              }
            ]
          }
        ]
      }
    ],
    math: [
      {
        id: 'math-basic-001',
        title: "Basic Addition",
        level: 'Basic',
        passages: [
          {
            id: 'p1',
            text: null,
            questions: [
              {
                id: 'q1',
                question: 'What is 2 + 3?',
                options: ['4', '5', '6', '7'],
                correctAnswer: 1,
                explanation: '2 + 3 = 5'
              },
              {
                id: 'q2',
                question: 'What is 10 + 15?',
                options: ['20', '25', '30', '35'],
                correctAnswer: 1,
                explanation: '10 + 15 = 25'
              }
            ]
          }
        ]
      }
    ]
  }
};