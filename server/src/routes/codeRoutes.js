const express = require('express');
const router = express.Router();
const axios = require('axios');

const WANDBOX_API = 'https://wandbox.org/api/compile.json';

const COMPILER_MAP = {
  javascript: { compiler: 'nodejs-20.17.0',   options: ''      },
  python3:    { compiler: 'cpython-3.12.7',    options: ''      },
  cpp:        { compiler: 'gcc-head',          options: 'c++17' },
  java:       { compiler: 'openjdk-jdk-22+36', options: ''      },
  typescript: { compiler: 'typescript-5.6.2',  options: ''      },
  rust:       { compiler: 'rust-1.82.0',       options: ''      },
};

router.post('/execute', async (req, res) => {
  const { language, files } = req.body;
  let sourceCode = files?.[0]?.content;

  if (!language || !sourceCode) {
    return res.status(400).json({ run: { output: '', stderr: 'Missing language or code.' } });
  }

  const config = COMPILER_MAP[language];
  if (!config) {
    return res.status(400).json({ run: { output: '', stderr: `Unsupported language: ${language}` } });
  }

  // ✅ Java fix: Wandbox saves as prog.java so 'public class Main' fails.
  // Stripping 'public' from the class declaration fixes it — the class
  // still runs perfectly, public is only required when filename must match.
  if (language === 'java') {
    sourceCode = sourceCode.replace(/public\s+class\s+/g, 'class ');
  }

  console.log(`[Wandbox] language=${language} compiler=${config.compiler}`);

  try {
    const payload = {
      compiler: config.compiler,
      code: sourceCode,
      ...(config.options && { options: config.options }),
    };

    const response = await axios.post(WANDBOX_API, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    const { program_output, program_error, compiler_error } = response.data;

    return res.json({
      run: {
        output: program_output || '',
        stderr: program_error || compiler_error || '',
      }
    });

  } catch (err) {
    console.error('[Execute Error]', err?.response?.status, JSON.stringify(err?.response?.data), err.message);
    return res.status(500).json({
      run: { output: '', stderr: JSON.stringify(err?.response?.data) || err.message || 'Execution failed.' }
    });
  }
});

module.exports = router;