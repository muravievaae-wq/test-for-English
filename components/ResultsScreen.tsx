
import React from 'react';
import { type TestResult } from '../types';

interface ResultsScreenProps {
  result: TestResult;
  onViewDashboard: () => void;
  onStartNewTest: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ result, onViewDashboard, onStartNewTest }) => {
  return (
    <div className="text-center animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Тест завершен!</h2>
      <p className="text-lg text-slate-600 mb-6">Спасибо, {result.studentData.fullName}!</p>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 my-8">
        <p className="text-xl text-slate-700">Ваш предполагаемый уровень:</p>
        <p className="text-5xl font-extrabold text-blue-600 my-4">{result.preliminaryLevel}</p>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Это предварительная оценка. Окончательный результат будет определен преподавателем после детальной проверки ваших ответов, особенно в секциях "Письмо" и "Говорение".
        </p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={onStartNewTest}
          className="bg-slate-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-transform transform hover:scale-105"
        >
          Пройти новый тест
        </button>
        <button
          onClick={onViewDashboard}
          className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
        >
          Панель преподавателя (симуляция)
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;
