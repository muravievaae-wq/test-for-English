
import React, { useState } from 'react';
import { type TestResult, QuestionType } from '../types';
import { testQuestions } from '../constants/testData';

interface TeacherDashboardProps {
  results: TestResult[];
  onBack: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ results, onBack }) => {
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  if (selectedResult) {
    return <ResultDetails result={selectedResult} onBack={() => setSelectedResult(null)} />;
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold mb-6">Панель преподавателя</h2>
      {results.length === 0 ? (
        <p className="text-slate-500 text-center py-8">Пока нет завершенных тестов.</p>
      ) : (
        <div className="space-y-4">
          {results.slice().reverse().map(result => (
            <div key={result.id} className="bg-slate-50 p-4 rounded-lg shadow-sm flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800">{result.studentData.fullName}</p>
                <p className="text-sm text-slate-500">
                  {result.completedAt} - Уровень: <span className="font-semibold">{result.preliminaryLevel}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedResult(result)}
                className="bg-blue-500 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition"
              >
                Посмотреть детали
              </button>
            </div>
          ))}
        </div>
      )}
       <div className="mt-8 flex justify-center">
            <button onClick={onBack} className="text-blue-600 hover:underline font-semibold">
                &larr; На главную
            </button>
       </div>
    </div>
  );
};

const ResultDetails: React.FC<{ result: TestResult, onBack: () => void }> = ({ result, onBack }) => {
  const getQuestion = (id: number) => testQuestions.find(q => q.id === id);

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="text-blue-600 hover:underline font-semibold mb-4">
        &larr; Назад к списку
      </button>
      <h3 className="text-2xl font-bold mb-4">{result.studentData.fullName}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-100 p-4 rounded-lg">
            <h4 className="font-semibold text-slate-800 mb-2">Информация о студенте</h4>
            <p><strong>Возраст:</strong> {result.studentData.age}</p>
            <p><strong>Цели:</strong> {result.studentData.goals}</p>
            <p><strong>Страхи:</strong> {result.studentData.fears || 'Не указано'}</p>
            <p><strong>Навык для улучшения:</strong> {result.studentData.skillToImprove || 'Не указано'}</p>
            <p><strong>Тип занятий:</strong> {result.studentData.lessonType}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center flex flex-col justify-center">
            <h4 className="font-semibold text-slate-800">Предварительный уровень</h4>
            <p className="text-3xl font-bold text-blue-600">{result.preliminaryLevel}</p>
            <p className="text-sm text-slate-500 mt-1">Авто-оценка (без письма/говорения): {result.score} / {result.maxScore}</p>
        </div>
      </div>
      
      <h4 className="text-xl font-semibold mb-4">Ответы на тест</h4>
      <div className="space-y-4">
        {result.answers.map(answer => {
            const q = getQuestion(answer.questionId);
            if (!q) return null;
            const isManual = q.type === QuestionType.WRITING || q.type === QuestionType.SPEAKING;

            return (
                <div key={answer.questionId} className="bg-white p-4 border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-slate-800 flex-1">{q.id}. {q.prompt}</p>
                      <span className="ml-4 text-xs font-bold text-white bg-slate-500 px-2 py-1 rounded-full">{q.level}</span>
                    </div>
                    {isManual ? (
                        <p className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-slate-700 whitespace-pre-wrap">
                            <em>Ответ для ручной проверки:</em><br/>{answer.userAnswer}
                        </p>
                    ) : (
                        <>
                            <p className={`mt-1 text-sm ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                Ответ студента: {answer.userAnswer}
                            </p>
                            {!answer.isCorrect && <p className="text-sm text-blue-600">Правильный ответ: {q.correctAnswer}</p>}
                        </>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
}

export default TeacherDashboard;
