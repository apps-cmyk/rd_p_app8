import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const API_KEY = '88cff66207msh822edddea214699p16a6c1jsne5a37e63c318';
const API_HOST = 'imdb236.p.rapidapi.com';
const BASE_URL = 'https://imdb236.p.rapidapi.com';

const DEFAULT_HEADERS = {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': API_HOST,
};

// Request queue to prevent simultaneous requests causing 429
let requestQueue: Promise<any> = Promise.resolve();
const REQUEST_GAP_MS = 300;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Executes an API request with automatic retry for 429 (Rate Limit) and 403 (Forbidden) errors.
 * Requests are queued to prevent overwhelming the API.
 */
export const apiRequest = async (
    url: string,
    params?: Record<string, any>,
    config?: Partial<AxiosRequestConfig>
): Promise<any> => {
    // Queue request to prevent concurrent calls
    const result = requestQueue.then(async () => {
        await delay(REQUEST_GAP_MS);
        return executeWithRetry(url, params, config);
    });

    requestQueue = result.catch(() => { }); // Prevent queue from breaking on errors
    return result;
};

const executeWithRetry = async (
    url: string,
    params?: Record<string, any>,
    config?: Partial<AxiosRequestConfig>,
    attempt: number = 0,
    maxRetries: number = 3,
): Promise<any> => {
    try {
        const options: AxiosRequestConfig = {
            method: 'GET',
            url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
            headers: DEFAULT_HEADERS,
            params,
            timeout: 15000,
            ...config,
        };

        const response: AxiosResponse = await axios.request(options);
        return response.data;
    } catch (error: any) {
        const status = error?.response?.status;

        // Handle 429 (Too Many Requests) - retry with exponential backoff
        if (status === 429 && attempt < maxRetries) {
            const retryAfter = error?.response?.headers?.['retry-after'];
            const backoffMs = retryAfter
                ? parseInt(retryAfter, 10) * 1000
                : 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
            console.warn(`[apiClient] 429 Rate Limited. Retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`);
            await delay(backoffMs);
            return executeWithRetry(url, params, config, attempt + 1, maxRetries);
        }

        // Handle 403 (Forbidden) - single retry after delay (may be temporary)
        if (status === 403 && attempt < 1) {
            console.warn(`[apiClient] 403 Forbidden. Retrying once in 1s...`);
            await delay(1000);
            return executeWithRetry(url, params, config, attempt + 1, maxRetries);
        }

        // Handle network errors - retry with backoff
        if (!error.response && attempt < maxRetries) {
            const backoffMs = 1000 * Math.pow(2, attempt);
            console.warn(`[apiClient] Network error. Retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`);
            await delay(backoffMs);
            return executeWithRetry(url, params, config, attempt + 1, maxRetries);
        }

        throw error;
    }
};

export { API_KEY, API_HOST, BASE_URL, DEFAULT_HEADERS };
