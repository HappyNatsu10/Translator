'use client';
import { ArrowLeftRight, Settings, Trash2, Volume2 } from 'lucide-react';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { PiTranslateBold } from 'react-icons/pi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';

import {
  DropdownMenu,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"





interface Language {
  language: string;
  name: string;
}

interface TranslationHistory {
  id: string;
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  translatedText: string;
}

export default function Home() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [targetLang, setTargetLang] = useState<string>('en');
  const [sourceText, setSourceText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [history, setHistory] = useState<TranslationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState("light")
  const [isOpen, setIsOpen] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY as string;

  useEffect(() => {
    const supportedLanguages: Language[] = [
      { language: "en", name: "English" },
      { language: "es", name: "Spanish" },
      { language: "fr", name: "French" },
      { language: "de", name: "German" },
      { language: "ar", name: "Arabic" },
      { language: "hi", name: "Hindi" },
      { language: "zh", name: "Chinese" },
      { language: "ja", name: "Japanese" },
      { language: "ko", name: "Korean" },
      { language: "pt", name: "Portuguese" },
      { language: "ru", name: "Russian" },
      { language: "tr", name: "Turkish" },
      // Add more as needed
    ];

    setLanguages(supportedLanguages);
  }, []);

  useEffect(() => {
    // Load history from localStorage
    const saved = localStorage.getItem('translationHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Save history to localStorage
    localStorage.setItem('translationHistory', JSON.stringify(history));
  }, [history]);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('https://text-translator2.p.rapidapi.com/translate', {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'text-translator2.p.rapidapi.com',
        },
        body: new URLSearchParams({
          source_language: sourceLang === 'auto' ? 'auto' : sourceLang,
          target_language: targetLang,
          text: sourceText,
        }),
      });

      const json = await res.json();

      if (json?.data?.translatedText) {
        const result = json.data.translatedText;
        setTranslatedText(result);

        const entry: TranslationHistory = {
          id: Date.now().toString(),
          sourceLang,
          targetLang,
          sourceText,
          translatedText: result,
        };
        setHistory((prev) => [entry, ...prev.slice(0, 9)]); // limit to 10
      } else {
        setError('Translation failed – please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error – please try again.');
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;
    speechSynthesis.speak(utterance);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((entry) => entry.id !== id));
  };

  return (
    <div className={mode ==="light"?" bg-white" : "bg-[#09090b] text-white"}>
      {/* Header */}
      <div className="flex justify-between items-center py-6 lg:mx-12 mx-6">
        <div className="flex gap-2.5 items-center">
          <Image src="/logo.svg" alt="LinguaLibre logomark" width={60} height={60} />
          <h1 className="text-[28px] font-medium">LinguaLibre</h1>
        </div>
        <button onClick={() =>setIsOpen(true)} className={mode ==="light" ?"bg-black p-3 rounded-2xl text-[22px] font-medium text-white lg:hidden flex items-center gap-2.5" :" bg-white text-black p-3 rounded-2xl text-[22px] font-medium lg:hidden flex items-center gap-2.5" }>
          <Settings />
        </button>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <button className={mode ==="light" ? "bg-black p-3 rounded-2xl text-[22px] font-medium text-white hidden lg:flex items-center gap-2.5 cursor-pointer" :" bg-white text-black p-3 rounded-2xl text-[22px] font-medium hidden lg:flex items-center gap-2.5 cursor-pointer" }>
              Settings <Settings />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 right-0">
            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={mode} onValueChange={setMode}>
              <DropdownMenuRadioItem
                value='light'
              >
                Light Mode
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value='dark'
              >
                Dark Mode
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Translation section */}
      <div className="flex justify-between lg:flex-row flex-col items-center lg:items-start  my-6 lg:mx-12 mx-6 gap-5">
        <div className="lg:w-[550px] w-full">
          <Select value={sourceLang} onValueChange={setSourceLang}>
            <SelectTrigger className={mode === "light" ? "mb-6 p-2 border-2 border-black w-full rounded-md" : "mb-6 p-2 border-2 border-white w-full rounded-md"}>
              <SelectValue placeholder="Detect language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Detect language</SelectItem>
              {languages.map((lang) => (
                <SelectItem key={lang.language} value={lang.language}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            className={mode === "light" ? "h-[350px] mb-6 border-2 border-[#000]" : "h-[350px] mb-6 border-2 border-[#fff]" }
            placeholder="Enter text to translate"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              onClick={handleTranslate}
              disabled={loading}
              className={mode ==="light" ? "bg-black p-3 rounded-2xl text-[22px] font-medium text-white flex items-center gap-2.5 cursor-pointer disabled:opacity-50" :" disabled:opacity-50 bg-white text-black p-3 rounded-2xl text-[22px] font-medium flex items-center gap-2.5 cursor-pointer" }
            >
              {loading ? 'Translating…' : 'Translate'} <PiTranslateBold />
            </button>
          </div>
        </div>

        <ArrowLeftRight />

        <div className="lg:w-[550px] w-full">
          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger className={mode === "light" ? "mb-6 p-2 border-2 border-black w-full rounded-md" : "mb-6 p-2 border-2 border-white w-full rounded-md"}>
              <SelectValue placeholder="Select a Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.language} value={lang.language}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            className={mode === "light" ? "h-[350px] mb-6 border-2 border-[#000]" : "h-[350px] mb-6 border-2 border-[#fff]" }
            placeholder="Translation will appear here"
            value={translatedText}
            readOnly
          />
          {translatedText && (
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => speak(translatedText)}
                className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-xl cursor-pointer"
              >
                Speak <Volume2 />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <div className="mx-12 mt-8">
        <h2 className="text-xl font-semibold mb-4">Translation History</h2>
        <ul className="space-y-4">
          {history.map((item) => (
            <li key={item.id} className="border p-4 rounded-lg flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm mb-1">
                  {item.sourceLang} → {item.targetLang}
                </p>
                <p className="font-medium">&quot;{item.sourceText}&quot;</p>
                <p className="text-green-700 mt-1">→ {item.translatedText}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => speak(item.translatedText)}
                  className="text-blue-600 hover:underline"
                >
                  <Volume2 />
                </button>
                <button
                  onClick={() => deleteHistoryItem(item.id)}
                  className="text-red-500 hover:underline"
                >
                  <Trash2 />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-center mt-4">
          {error}
        </p>
      )}
      <footer className={mode === "light" ?'flex justify-center items-center text-2xl mt-6 p-6 border-t-2 border-t-[#000]' : 'flex justify-center items-center text-2xl mt-6 p-6 border-t-2 border-t-[#fff]'}>
        <p>Made by HappyNatsu © 2025</p>
      </footer>
    </div>
  );
}
