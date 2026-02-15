import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';

/**
 * Code Editor Component
 * Wraps Monaco Editor with language selection and theme toggle
 * 
 * Props:
 * - value: string - Current code
 * - onChange: function - Called when code changes
 * - language: string - Programming language
 * - onLanguageChange: function - Called when language changes
 * - readOnly: boolean - Disable editing
 */
export default function CodeEditor({
  value = '',
  onChange = () => {},
  language = 'javascript',
  onLanguageChange = () => {},
  readOnly = false,
}) {
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);

  const languages = [
    'javascript',
    'typescript',
    'python',
    'java',
    'cpp',
    'csharp',
    'go',
    'rust',
    'php',
    'ruby',
    'sql',
    'html',
    'css',
    'json',
    'markdown',
  ];

  const handleEditorChange = useCallback(
    (newCode) => {
      if (!readOnly && newCode !== undefined) {
        onChange(newCode);
      }
    },
    [onChange, readOnly]
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'vs-dark' ? 'vs-light' : 'vs-dark'));
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.min(prev + 1, 24));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.max(prev - 1, 8));
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Editor Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={readOnly}
            className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>

          <div className="flex gap-1 border-l border-gray-700 pl-3">
            <button
              onClick={increaseFontSize}
              title="Increase font size"
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition"
            >
              A+
            </button>
            <button
              onClick={decreaseFontSize}
              title="Decrease font size"
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition"
            >
              A-
            </button>
            <span className="px-2 py-1 text-gray-400 text-sm">{fontSize}px</span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'vs-dark' ? 'light' : 'dark'} theme`}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition"
        >
          {theme === 'vs-dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={handleEditorChange}
          theme={theme}
          options={{
            readOnly,
            fontSize,
            fontFamily: "'Fira Code', 'Courier New', monospace",
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            minimap: { enabled: true },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
            'bracketpaircolorizer.deprecatedOptions.colorize': false,
          }}
          defaultValue={value}
        />
      </div>

      {/* Info bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 text-xs text-gray-400 flex justify-between">
        <span>
          {value.split('\n').length} lines • {value.length} characters
        </span>
        {readOnly && <span className="text-yellow-400">Read-only mode</span>}
      </div>
    </div>
  );
}
