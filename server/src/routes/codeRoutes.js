const express = require('express');
const router = express.Router();
const axios = require('axios');

const WANDBOX_API = 'https://wandbox.org/api/compile.json';

// =======================
// COMPILER CONFIG
// =======================
const COMPILER_MAP = {
  javascript: { compiler: 'nodejs-20.17.0', options: '' },
  python3:    { compiler: 'cpython-3.12.7', options: '' },
  cpp:        { compiler: 'gcc-head', options: 'c++17' },
  java:       { compiler: 'openjdk-jdk-22+36', options: '' },
  typescript: { compiler: 'typescript-5.6.2', options: '' },
  rust:       { compiler: 'rust-1.82.0', options: '' },
};


// =======================
// EXECUTE ROUTE
// =======================
router.post('/execute', async (req, res) => {
  try {
    const { language, files } = req.body;

    let sourceCode = files?.[0]?.content;

    // 🔴 Validation
    if (!language || !sourceCode) {
      return res.status(400).json({
        run: { output: '', stderr: 'Missing language or code.' }
      });
    }

    const config = COMPILER_MAP[language];

    if (!config) {
      return res.status(400).json({
        run: { output: '', stderr: `Unsupported language: ${language}` }
      });
    }

    // =======================
    // JAVA FIX
    // =======================
    if (language === 'java') {
      sourceCode = sourceCode.replace(/public\s+class\s+/g, 'class ');
    }

    console.log(`🚀 Executing: ${language} using ${config.compiler}`);

    // =======================
    // PAYLOAD
    // =======================
    const payload = {
      compiler: config.compiler,
      code: sourceCode,
    };

    if (config.options) {
      payload.options = config.options;
    }

    // =======================
    // API CALL
    // =======================
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
    console.error('❌ Execute Error:', err.message);

    return res.status(500).json({
      run: {
        output: '',
        stderr:
          err?.response?.data
            ? JSON.stringify(err.response.data)
            : err.message || 'Execution failed.'
      }
    });
  }
});

module.exports = router;