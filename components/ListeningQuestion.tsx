
import React, { useState, useCallback, useEffect } from 'react';
import { type Question } from '../types';
import { generateAudio } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';

interface ListeningQuestionProps {
  question: Question;
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
}

const SpeakerWaveIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
);

const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
let audioContext: AudioContext | null = null;

const ListeningQuestion: React.FC<ListeningQuestionProps> = ({ question, selectedAnswer, onAnswerSelect }) => {
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
      if (!audioContext) {
          try {
              audioContext = new AudioContext({ sampleRate: 24000 });
          } catch(e) {
              console.error("Web Audio API is not supported in this browser.", e);
              setAudioError("Ваш браузер не поддерживает воспроизведение аудио.");
          }
      }
      return () => {
        if(audioContext && audioContext.state !== 'closed') {
           // audioContext.close(); // Don't close, reuse it
        }
      }
  }, [])
  
  const playAudio = useCallback(async () => {
    if (!question.listeningText || isLoadingAudio || isPlaying || !audioContext) return;
    setIsLoadingAudio(true);
    setAudioError(null);
    try {
      const base64Audio = await generateAudio(question.listeningText);
      if (base64Audio && audioContext) {
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        const decodedBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => setIsPlaying(false);
        source.start(0);
        setIsPlaying(true);
      } else {
        throw new Error("Не удалось сгенерировать аудио.");
      }
    } catch (error) {
        console.error(error);
        setAudioError(error instanceof Error ? error.message : "Произошла ошибка при загрузке аудио.");
    } finally {
      setIsLoadingAudio(false);
    }
  }, [question.listeningText, isLoadingAudio, isPlaying]);

  return (
    <div className="mt-4">
      <button
        onClick={playAudio}
        disabled={isLoadingAudio || isPlaying}
        className="flex items-center justify-center gap-3 px-6 py-3 mb-4 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
      >
        <SpeakerWaveIcon className="w-6 h-6"/>
        {isLoadingAudio ? 'Загрузка...' : isPlaying ? 'Воспроизведение...' : 'Прослушать аудио'}
      </button>

      {audioError && <p className="text-red-500 text-sm">{audioError}</p>}
      
      <div className="space-y-3 mt-4">
        {question.options?.map((option, index) => (
          <label key={index} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${selectedAnswer === option ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-500' : 'border-slate-300 hover:bg-slate-50'}`}>
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option}
              checked={selectedAnswer === option}
              onChange={(e) => onAnswerSelect(e.target.value)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-400"
            />
            <span className="ml-4 text-slate-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ListeningQuestion;
