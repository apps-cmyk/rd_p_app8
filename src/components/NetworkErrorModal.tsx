import React, { useEffect } from 'react';
import { Alert, Platform } from 'react-native';

interface NetworkErrorModalProps {
    visible: boolean;
    onReconnect: () => void;
    isReconnecting?: boolean;
    retryCount?: number;
}

export const NetworkErrorModal: React.FC<NetworkErrorModalProps> = ({
    visible,
    onReconnect,
    isReconnecting = false,
    retryCount = 0,
}) => {

    useEffect(() => {
        if (visible && !isReconnecting) {
            showNativeAlert();
        }
    }, [visible, isReconnecting, retryCount]);

    const showNativeAlert = () => {
        const message = retryCount > 0
            ? `Connection failed (attempt ${retryCount + 1}). Please check your connection and try again.`
            : 'Internet is required for this app to work properly. Please check your connection and try again.';

        const buttons = [
            {
                text: 'Cancel',
                style: 'cancel' as const,
            },
            {
                text: 'Ok',
                onPress: onReconnect,
                style: 'default' as const,
            },
        ];

        if (Platform.OS === 'ios') {
            Alert.alert(
                'No Internet Connection',
                message,
                buttons,
                { cancelable: false }
            );
        } else {
            Alert.alert(
                'No Internet Connection',
                message,
                buttons,
                { cancelable: false }
            );
        }
    };

    return null;
};

