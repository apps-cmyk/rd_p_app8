export const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            if (error.name !== 'NetworkError' && error.message !== 'NETWORK_ERROR') {
                throw error;
            }

            if (attempt === maxRetries) {
                break;
            }

            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
};

export const isNetworkError = (error: any): boolean => {
    return (
        error.name === 'NetworkError' ||
        error.message === 'NETWORK_ERROR' ||
        error.code === 'ECONNABORTED' ||
        error.message === 'Network Error' ||
        !error.response
    );
};
