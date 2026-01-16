import React from 'react';
import { View, TouchableOpacity, StyleSheet, useWindowDimensions, Text, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../theme';
import { images } from '../../assets/images';

const getTabLabel = (routeName: string) => {
    if (routeName === 'Home') return 'Home';
    if (routeName === 'Search') return 'Search';
    if (routeName === 'Categories') return 'Categories';
    if (routeName === 'Favorites') return 'Saved';
    return '';
};

const getTabIcon = (routeName: string, isFocused: boolean) => {
    if (routeName === 'Home') return images.HOME;
    if (routeName === 'Search') return images.SEARCH;
    if (routeName === 'Categories') return images.CATEGORIES;
    if (routeName === 'Favorites') return images.FAVORITES;
    return null;
};

export const TabView = ({ state, navigation }: { state: any; navigation: any }) => {
    const { width, height } = useWindowDimensions();
    const tabRoutes = state.routes;
    const insets = useSafeAreaInsets();

    const renderTab = (route: any) => {
        const isFocused =
            state.index === state.routes.findIndex((r: any) => r.key === route.key);
        const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
            <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={[
                    styles.tab
                ]}
            >
                <View
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: height * 0.2,
                        marginTop: -8,
                    }}
                >
                    <Image
                        source={getTabIcon(route.name, isFocused)}
                        style={{
                            width: 20,
                            height: 20,
                        }}
                        tintColor={isFocused ? theme.colors.white : theme.colors.lightGray}
                    />
                    <Text
                        style={{
                            color: isFocused ? theme.colors.white : theme.colors.lightGray,
                            fontSize: 12,
                            fontWeight: '500',
                            marginTop: 2,
                            textAlign: 'center',
                        }}
                    >
                        {getTabLabel(route.name)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <LinearGradient
            colors={[theme.colors.lighterBlack, theme.colors.darkAsphalt]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.container, { height: height * 0.1 }]}
        >
            <View style={styles.content}>
                {tabRoutes.map(renderTab)}
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    content: {
        flexDirection: 'row',
        flex: 1,
        paddingBottom: 8,
        paddingTop: 8,
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        flex: 1,
    },
});
