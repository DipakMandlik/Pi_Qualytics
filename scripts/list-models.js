
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
                    process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
                }
            });
        }
    } catch (e) { }
}

async function listModels() {
    loadEnv();
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error('No API Key');
        return;
    }

    console.log(`Querying models for key: ${apiKey.substring(0, 5)}...`);

    // Try v1beta
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error('API Error:', JSON.stringify(data.error, null, 2));
        } else if (data.models) {
            console.log('Available Models:');
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name} (${m.supportedGenerationMethods})`);
                }
            });
        } else {
            console.log('No models found in response:', data);
        }
    } catch (e) {
        console.error('Fetch failed:', e.message);
    }
}

listModels();
