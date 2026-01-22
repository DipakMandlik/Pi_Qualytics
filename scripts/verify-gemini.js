
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');

function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            content.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["']|["']$/g, '');
                    process.env[key] = value;
                }
            });
        }
    } catch (e) {
        console.error('Failed to load .env.local', e);
    }
}

async function verifyGemini() {
    loadEnv();
    console.log('🔍 Verifying Gemini Configuration (CommonJS)...');

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        console.error('❌ FAIL: No Gemini API Key found in .env.local');
        process.exit(1);
    }

    console.log('✅ API Key found (starts with', apiKey.substring(0, 4) + '...)');

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTest = [
        'gemini-2.0-flash',
        'gemini-flash-latest',
        'gemini-pro-latest',
        'gemini-2.5-flash'
    ];

    let success = false;

    for (const modelName of modelsToTest) {
        process.stdout.write(`Testing model: ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('ping');
            console.log('✅ WORKING');
            success = true;
            break;
        } catch (error) {
            console.log(`❌ FAILED: ${error.message}`);
        }
    }

    if (success) {
        console.log('✅ SUCCESS: Gemini is ready!');
    } else {
        console.error('❌ FAIL: All models failed. Please check your API key scope and billing status.');
    }
}

verifyGemini();
