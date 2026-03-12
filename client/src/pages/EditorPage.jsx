import { LANGUAGES } from '../constants/languages';
// ... other imports

export default function EditorPage() {
  const [language, setLanguage] = useState('javascript');
  // ... existing socket/auth logic

  return (
    <div className="flex h-screen text-white overflow-hidden">
      {/* ... Sidebar ... */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-white/5 bg-surface/20 backdrop-blur-sm flex items-center justify-between px-8">
          <div className="flex items-center gap-4 font-['Space_Grotesk']">
            <span className="text-purple-400 font-bold uppercase tracking-widest">{language}</span>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg text-xs p-1 outline-none"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value} className="bg-surface">{lang.label}</option>
              ))}
            </select>
          </div>
          {/* ... User Avatars & Leave Button ... */}
        </header>

        <main className="flex-1 relative">
          <Editor
            theme="vs-dark"
            language={language}
            // ... rest of Monaco options
          />
        </main>
      </div>
    </div>
  );
}