
const fs = require('fs');
const path = require('path');

async function downloadPdf() {
    try {
        console.log("Fetching PDF Report...");
        const response = await fetch('http://localhost:3000/api/reports/daily-pdf');

        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }

        const contentType = response.headers.get('content-type');
        const disposition = response.headers.get('content-disposition');
        console.log(`Content-Type: ${contentType}`);
        console.log(`Content-Disposition: ${disposition}`);

        if (contentType !== 'application/pdf') {
            console.error("FAIL: Content-Type is not application/pdf");
            return;
        }

        const buffer = await response.arrayBuffer();
        console.log(`Downloaded ${buffer.byteLength} bytes.`);

        if (buffer.byteLength < 1000) {
            console.warn("WARNING: PDF size seems very small. Might be empty or error page.");
        } else {
            console.log("SUCCESS: PDF downloaded and size looks reasonable.");
        }

    } catch (error) {
        console.error("Fetch failed:", error.message);
        console.log("NOTE: Ensure the dev server is running on localhost:3000");
    }
}

downloadPdf();
