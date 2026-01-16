import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);
    const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);

    useEffect(() => {
        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
            setIsInternetReachable(state.isInternetReachable);
        });

        // Fetch current network state
        NetInfo.fetch().then(state => {
            setIsConnected(state.isConnected);
            setIsInternetReachable(state.isInternetReachable);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const checkConnection = async (): Promise<boolean> => {
        const state = await NetInfo.fetch();
        setIsConnected(state.isConnected);
        setIsInternetReachable(state.isInternetReachable);
        return state.isConnected === true && state.isInternetReachable !== false;
    };

    return {
        isConnected: isConnected === true && isInternetReachable !== false,
        isInternetReachable,
        checkConnection,
    };
};

