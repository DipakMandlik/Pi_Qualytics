
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyGemini() {
    console.log('🔍 Verifying Gemini Configuration...');

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        console.error('❌ FAIL: No Gemini API Key found in .env.local');
        console.log('👉 Action: Add GEMINI_API_KEY=your_key_here to .env.local');
        process.exit(1);
    }

    console.log('✅ API Key found (ends with ' + apiKey.slice(-4) + ')');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    try {
        console.log('🚀 Sending test prompt to gemini-1.5-flash...');
        const result = await model.generateContent('Say "Gemini is ready" if you can hear me.');
        const response = result.response.text();
        console.log('🤖 Response:', response);
        console.log('✅ SUCCESS: Gemini is configured and working!');
    } catch (error: any) {
        console.error('❌ FAIL: API Call failed:', error.message);
        if (error.message.includes('403') || error.message.includes('permission')) {
            console.log('👉 Possible Issue: API Key is invalid or has no quota.');
        }
    }
}

verifyGemini();
