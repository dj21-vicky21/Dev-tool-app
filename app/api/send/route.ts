'use server'

import axios from 'axios';
import axiosRetry from 'axios-retry';

export async function POST(request: Request) {
  // Basic Auth check
  const authHeader = request.headers.get('authorization');
  const expectedUser = process.env.NEXT_PUBLIC_BASIC_AUTH_USER;
  const expectedPass = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD;
  const web3formsAccessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

  const expected =
    'Basic ' + Buffer.from(`${expectedUser}:${expectedPass}`).toString('base64');

  if (!authHeader || authHeader !== expected) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { email, feedbackType, toolName, message } = await request.json();

    if (!email || !feedbackType || !toolName || !message) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Create axios instance with retry capability
    const client = axios.create();
    axiosRetry(client, { 
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // Retry on network errors or 5xx responses
        return Boolean(
          axiosRetry.isNetworkOrIdempotentRequestError(error) || 
          (error.response && error.response.status >= 500)
        );
      }
    });

    // Prepare form data for Web3Forms
    const formData = new URLSearchParams();
    formData.append('access_key', web3formsAccessKey!);

    formData.append('subject', `${email} sent a feedback from devgarage`);
    formData.append('email', email);
    formData.append('message', message);
    formData.append('feedbackType', feedbackType);
    formData.append('toolName', toolName);

    // Send POST request to Web3Forms using axios with retry
    const response = await client.post('https://api.web3forms.com/submit', 
      formData.toString(),
      {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    // Return success response
    return Response.json({ 
      success: true, 
      message: 'Email sent successfully.',
      data: response.data
    });
    
  } catch (error) {
    console.error("Email sending failed:", error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email.' 
    }, { status: 500 });
  }
}
