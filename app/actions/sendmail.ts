'use server'

import axios from 'axios';
import axiosRetry from 'axios-retry';

const client = axios.create();

axiosRetry(client, { 
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        return Boolean(axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response && error.response.status >= 500));
    }
});

export async function sendEmail(email: string, feedbackType: string, toolName: string, message: string) {
   try {
    const username = process.env.BASIC_AUTH_USER;
    const password = process.env.BASIC_AUTH_PASSWORD;
    const baseUrl = process.env.BASE_URL;
    
    if (!username || !password) {
        throw new Error('Authentication credentials not configured');
    }

    // Create Basic Auth header
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    
    const response = await client.post(
        `${baseUrl}/api/send`, 
        { email, feedbackType, toolName, message },
        {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        }
    );
    
    return response.data;
   } catch (error) {
    return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email.' 
    }
   }
}