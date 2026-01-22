
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    console.log('Testing Gemini Models...');
    if (!apiKey) {
        console.error('❌ No API KEY found in .env.local');
        process.exit(1);
    }
    console.log(`API Key found: ${apiKey.substring(0, 5)}...`);

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTest = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest',
        'models/gemini-1.5-flash',
        'gemini-pro',
        'gemini-1.0-pro'
    ];

    for (const m of modelsToTest) {
        process.stdout.write(`Testing ${m}... `);
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent('ping');
            console.log(`✅ AVAILABLE`);
        } catch (e: any) {
            if (e.message.includes('404')) {
                console.log(`❌ 404 Not Found`);
            } else {
                console.log(`❌ Error: ${e.message.split('\n')[0]}`);
            }
        }
    }
}

main();
