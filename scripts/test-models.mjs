
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

async function main() {
    // Manual env loading
    const envPath = path.resolve(process.cwd(), '.env.local');
    let apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey && fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const match = content.match(/GEMINI_API_KEY=(.*)/) || content.match(/GOOGLE_API_KEY=(.*)/);
        if (match) {
            apiKey = match[1].trim().replace(/^["'](.*)["']$/, '$1');
        }
    }

    console.log('Testing Gemini Models...');
    if (!apiKey) {
        console.error('❌ No API KEY found in .env.local or process.env');
        process.exit(1);
    }
    console.log(`API Key found: ${apiKey.substring(0, 5)}...`);

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTest = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest',
        'gemini-pro',
        'gemini-1.0-pro'
    ];

    for (const m of modelsToTest) {
        process.stdout.write(`Testing ${m}... `);
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent('ping');
            console.log(`✅ AVAILABLE`);
        } catch (e) {
            if (e.message && e.message.includes('404')) {
                console.log(`❌ 404 Not Found`);
            } else {
                console.log(`❌ Error: ${e.message ? e.message.split('\n')[0] : e}`);
            }
        }
    }
}

main();
