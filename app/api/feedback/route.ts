import { NextRequest, NextResponse } from 'next/server';

// Define your basic auth credentials (use environment variables in production)
const USERNAME = process.env.NEXT_PUBLIC_BASIC_AUTH_USER;
const PASSWORD = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD;

export async function POST(req: NextRequest) {
    const sendJsonResponse = (success: boolean, message: string, status: number) => {
        return NextResponse.json({ success, message }, { status });
    };
    try {
       
        // Check for Basic Auth
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return sendJsonResponse(false, 'Authorization header missing!', 400);
        }

        // Check content type
        if (req.headers.get('content-type') !== 'application/json') {
            return sendJsonResponse(false, 'Invalid content type', 400);
        }

        // Decode and verify credentials
        const base64Credentials = authHeader.replace('Basic ', '');
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        if (username !== USERNAME || password !== PASSWORD) {
            return sendJsonResponse(false, 'Invalid credentials', 401);
        }

        // Parse JSON body
        const formData = await req.json();
       
        const { email, feedbackType, toolName , message} = formData;

        if (!email || !message || !feedbackType || !toolName) {
            return sendJsonResponse(false, 'Missing required fields', 400);
        }

        const accessKey = process.env.NEXT_PUBLIC_WEB3FORM;
        if (!accessKey) {
            console.error('Access key is not defined.');
            return sendJsonResponse(false, 'Access key is not defined.', 400);
        }

        formData.access_key = accessKey;
        formData.site = "DevGarage";

        // Forward the request to the external API
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        return sendJsonResponse(result.success, result.message || 'Request failed', result.success ? 200 : 400);

    } catch (error) {
        console.error('Error processing form:', error);
        return sendJsonResponse(false, 'Internal server error.', 500);
    }
}