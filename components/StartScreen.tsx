
import React, { useState } from 'react';
import { type StudentData } from '../types';

interface StartScreenProps {
  onStart: (data: StudentData) => void;
}

// Helper components moved outside of StartScreen to prevent re-creation on render, which fixes the focus issue.

interface InputFieldProps {
  name: keyof StudentData;
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
}

const InputField: React.FC<InputFieldProps> = ({ name, label, value, onChange, error, type = 'text' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${error ? 'border-red-500' : 'border-black'}`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

interface TextareaFieldProps {
  name: keyof StudentData;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
}

const TextareaField: React.FC<TextareaFieldProps> = ({ name, label, value, onChange, error }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <textarea
            id={name}
            name={name}
            rows={3}
            value={value}
            onChange={onChange}
            className={`w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${error ? 'border-red-500' : 'border-black'}`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);


const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [formData, setFormData] = useState<StudentData>({
    fullName: '',
    age: 18,
    goals: '',
    fears: '',
    skillToImprove: '',
    lessonType: 'individual',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? (value === '' ? '' : parseInt(value, 10)) : value,
    }));
  };
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Пожалуйста, введите ваше ФИО";
    if (Number(formData.age) < 6) newErrors.age = "Возраст должен быть не менее 6 лет";
    if (!formData.goals.trim()) newErrors.goals = "Пожалуйста, опишите ваши цели";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
        onStart(formData);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold text-center mb-2">Добро пожаловать!</h2>
      <p className="text-slate-600 text-center mb-6">Пожалуйста, заполните информацию о себе, чтобы мы могли начать тест.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField name="fullName" label="ФИО" error={errors.fullName} value={formData.fullName} onChange={handleChange} />
        <InputField name="age" label="Ваш возраст" error={errors.age} type="number" value={formData.age} onChange={handleChange} />
        
        <h3 className="text-lg font-medium text-slate-800 pt-4 border-t border-slate-200">Немного о ваших целях</h3>
        <TextareaField name="goals" label="С какой целью вы хотите изучать английский?" error={errors.goals} value={formData.goals} onChange={handleChange} />
        <TextareaField name="fears" label="Есть ли у вас страхи или трудности в изучении языка?" value={formData.fears} onChange={handleChange} />
        <TextareaField name="skillToImprove" label="Какой навык (чтение, говорение, письмо и т.д.) вы хотели бы улучшить в первую очередь?" value={formData.skillToImprove} onChange={handleChange} />
        
        <div>
            <label htmlFor="lessonType" className="block text-sm font-medium text-slate-700 mb-1">Какой формат занятий вам наиболее интересен?</label>
            <select id="lessonType" name="lessonType" value={formData.lessonType} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-black rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                <option value="individual">Индивидуальные</option>
                <option value="group">Групповые</option>
                <option value="self-study">Самостоятельные</option>
            </select>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105">
          Начать тест
        </button>
      </form>
    </div>
  );
};

export default StartScreen;