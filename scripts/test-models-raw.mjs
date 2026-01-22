
import fs from 'fs';
import path from 'path';

async function main() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    let apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey && fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const match = content.match(/GEMINI_API_KEY=(.*)/) || content.match(/GOOGLE_API_KEY=(.*)/);
        if (match) {
            apiKey = match[1].trim().replace(/^["'](.*)["']$/, '$1');
        }
    }

    if (!apiKey) {
        console.error('No API Key');
        return;
    }

    console.log('Fetching models from https://generativelanguage.googleapis.com/v1beta/models...');
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }
        const data = await response.json();
        console.log('Available Models:');
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log('No models returned in list.');
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error('Fetch failed:', e);
    }
}

main();
