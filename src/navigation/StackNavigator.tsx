import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabNavigator } from './TabNavigator';
import {
    MovieDetailsScreen,
    PopularMoviesScreen,
    Top250MoviesScreen,
    TopRatedMoviesScreen,
    Top250TvShowsScreen,
    PopularTvShowsScreen,
    LowRatedMoviesScreen
} from '../screens';
import { RootStackParamList } from '../types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

export const StackNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#000000' },
            }}
            initialRouteName="TabNavigator"
        >
            <Stack.Screen name="TabNavigator" component={TabNavigator} />
            <Stack.Screen
                name="MovieDetails"
                component={MovieDetailsScreen}
            />
            <Stack.Screen
                name="PopularMovies"
                component={PopularMoviesScreen}
            />
            <Stack.Screen
                name="Top250Movies"
                component={Top250MoviesScreen}
            />
            <Stack.Screen
                name="TopRatedMovies"
                component={TopRatedMoviesScreen}
            />
            <Stack.Screen
                name="Top250TvShows"
                component={Top250TvShowsScreen}
            />
            <Stack.Screen
                name="PopularTvShows"
                component={PopularTvShowsScreen}
            />
            <Stack.Screen
                name="LowRatedMovies"
                component={LowRatedMoviesScreen}
            />
        </Stack.Navigator>
    );
};
