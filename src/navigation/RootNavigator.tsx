import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StackNavigator } from './';

export const RootNavigator = () => {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <StackNavigator />
            </NavigationContainer>
        </SafeAreaProvider>
    );
};
