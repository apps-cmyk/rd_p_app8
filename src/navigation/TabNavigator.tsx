import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen, SearchScreen, CategoriesScreen, FavoritesScreen } from '../screens';
import { TabView } from '../components';
import { TabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={props => <TabView {...props} />}
            screenOptions={{
                headerShown: false,
            }}
            initialRouteName="Home"
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Categories" component={CategoriesScreen} />
            <Tab.Screen name="Favorites" component={FavoritesScreen} />
        </Tab.Navigator>
    );
};