
import React, { useState, useCallback } from 'react';
import StartScreen from './components/StartScreen';
import TestScreen from './components/TestScreen';
import ResultsScreen from './components/ResultsScreen';
import TeacherDashboard from './components/TeacherDashboard';
import { type StudentData, type TestResult } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

type AppState = 'start' | 'test' | 'results' | 'dashboard';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('start');
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [currentTestResult, setCurrentTestResult] = useState<TestResult | null>(null);
  const [allTestResults, setAllTestResults] = useLocalStorage<TestResult[]>('allTestResults', []);

  const handleStartTest = useCallback((data: StudentData) => {
    setStudentData(data);
    setAppState('test');
  }, []);

  const handleTestComplete = useCallback((result: TestResult) => {
    setCurrentTestResult(result);
    setAllTestResults(prevResults => [...prevResults, result]);
    setAppState('results');
  }, [setAllTestResults]);
  
  const handleViewDashboard = useCallback(() => {
    setAppState('dashboard');
  }, []);

  const handleStartNewTest = useCallback(() => {
    setStudentData(null);
    setCurrentTestResult(null);
    setAppState('start');
  }, []);

  const renderContent = () => {
    switch (appState) {
      case 'start':
        return <StartScreen onStart={handleStartTest} />;
      case 'test':
        if (!studentData) {
            setAppState('start');
            return null;
        }
        return <TestScreen studentData={studentData} onComplete={handleTestComplete} />;
      case 'results':
        if (!currentTestResult) {
            setAppState('start');
            return null;
        }
        return <ResultsScreen result={currentTestResult} onViewDashboard={handleViewDashboard} onStartNewTest={handleStartNewTest} />;
      case 'dashboard':
        return <TeacherDashboard results={allTestResults} onBack={handleStartNewTest} />;
      default:
        return <StartScreen onStart={handleStartTest} />;
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">English Placement Test</h1>
          <p className="text-slate-600 mt-2">Определите свой уровень английского</p>
        </header>
        <main className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {renderContent()}
        </main>
        <footer className="text-center mt-8 text-sm text-slate-500">
          <p>&copy; 2024 Your English Teacher. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
