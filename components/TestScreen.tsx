
import React, { useState, useMemo } from 'react';
import { type StudentData, type TestResult, type Answer, type Question, QuestionType, CEFRLevel } from '../types';
import { testQuestions } from '../constants/testData';
import ListeningQuestion from './ListeningQuestion';

interface TestScreenProps {
  studentData: StudentData;
  onComplete: (result: TestResult) => void;
}

const ProgressBar: React.FC<{ current: number, total: number }> = ({ current, total }) => {
    const percentage = (current / total) * 100;
    return (
        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const TestScreen: React.FC<TestScreenProps> = ({ studentData, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const currentQuestion = useMemo(() => testQuestions[currentQuestionIndex], [currentQuestionIndex]);
  const isLastQuestion = currentQuestionIndex === testQuestions.length - 1;

  const handleNext = () => {
    if (!currentQuestion) return;

    let isCorrect: boolean | undefined = undefined;
    if (currentQuestion.type !== QuestionType.WRITING && currentQuestion.type !== QuestionType.SPEAKING) {
      if (!currentAnswer.trim()) return; // Prevent empty answers for multiple choice
      isCorrect = currentAnswer === currentQuestion.correctAnswer;
    }

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      userAnswer: currentAnswer,
      isCorrect: isCorrect,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setCurrentAnswer('');

    if (isLastQuestion) {
      finishTest(updatedAnswers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const finishTest = (finalAnswers: Answer[]) => {
    const autoGradedAnswers = finalAnswers.filter(a => a.isCorrect !== undefined);
    const score = autoGradedAnswers.reduce((acc, answer) => {
        const question = testQuestions.find(q => q.id === answer.questionId);
        if (question && answer.isCorrect) {
            return acc + question.points;
        }
        return acc;
    }, 0);
    
    const maxScore = testQuestions.reduce((sum, q) => sum + q.points, 0);

    // New level calculation logic
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const scoresByLevel: Record<CEFRLevel, { score: number, maxScore: number }> = {
        A1: { score: 0, maxScore: 0 },
        A2: { score: 0, maxScore: 0 },
        B1: { score: 0, maxScore: 0 },
        B2: { score: 0, maxScore: 0 },
        C1: { score: 0, maxScore: 0 },
        C2: { score: 0, maxScore: 0 },
    };

    testQuestions.forEach(q => {
        if(q.type !== QuestionType.WRITING && q.type !== QuestionType.SPEAKING) {
            scoresByLevel[q.level].maxScore += q.points;
        }
    });

    autoGradedAnswers.forEach(answer => {
        const question = testQuestions.find(q => q.id === answer.questionId);
        if (question && answer.isCorrect) {
            scoresByLevel[question.level].score += question.points;
        }
    });
    
    let preliminaryLevel: string = "A1 (Beginner)";
    const PROFICIENCY_THRESHOLD = 0.6; // 60% proficiency to pass a level

    for (const level of levels) {
        const levelData = scoresByLevel[level];
        if (levelData.maxScore > 0) {
            const percentage = levelData.score / levelData.maxScore;
            if (percentage >= PROFICIENCY_THRESHOLD) {
                preliminaryLevel = `${level}`;
            } else {
                break; // Stop at the first level they don't pass
            }
        }
    }
    
    // Map level code to full name
    const levelMap: Record<string, string> = {
        'A1': 'A1 (Beginner)',
        'A2': 'A2 (Elementary)',
        'B1': 'B1 (Intermediate)',
        'B2': 'B2 (Upper-Intermediate)',
        'C1': 'C1 (Advanced)',
        'C2': 'C2 (Proficient)',
    };
    preliminaryLevel = levelMap[preliminaryLevel] || 'A1 (Beginner)';


    const result: TestResult = {
      id: new Date().toISOString(),
      studentData,
      answers: finalAnswers,
      score,
      maxScore: maxScore,
      preliminaryLevel,
      completedAt: new Date().toLocaleString('ru-RU'),
    };
    onComplete(result);
  };
  
  const renderQuestionContent = (question: Question) => {
    switch(question.type) {
      case QuestionType.LISTENING:
        return (
          <ListeningQuestion
            question={question}
            onAnswerSelect={(answer) => setCurrentAnswer(answer)}
            selectedAnswer={currentAnswer}
          />
        );
      case QuestionType.WRITING:
      case QuestionType.SPEAKING:
         return (
             <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                rows={6}
                className="w-full mt-4 p-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ваш ответ..."
             />
         );
      default:
        return (
          <div className="space-y-3 mt-4">
            {question.options?.map((option, index) => (
              <label key={index} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${currentAnswer === option ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-500' : 'border-slate-300 hover:bg-slate-50'}`}>
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-400"
                />
                <span className="ml-4 text-slate-700">{option}</span>
              </label>
            ))}
          </div>
        );
    }
  }

  if (!currentQuestion) {
    return <div>Тест завершен. Подсчет результатов...</div>;
  }

  return (
    <div className="animate-fade-in">
        <ProgressBar current={currentQuestionIndex} total={testQuestions.length} />
        <div className="bg-slate-50 p-6 rounded-lg shadow-inner">
            <h3 className="text-lg font-semibold text-slate-500">{currentQuestion.sectionTitle} - {currentQuestion.level}</h3>
            <p className="text-xl text-slate-800 mt-2 whitespace-pre-wrap">{currentQuestion.prompt}</p>
            {renderQuestionContent(currentQuestion)}
        </div>
        <div className="mt-8 flex justify-end">
            <button
                onClick={handleNext}
                className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
                disabled={(currentQuestion.type !== QuestionType.WRITING && currentQuestion.type !== QuestionType.SPEAKING) && !currentAnswer}
            >
                {isLastQuestion ? 'Завершить тест' : 'Следующий вопрос'}
            </button>
        </div>
    </div>
  );
};

export default TestScreen;
