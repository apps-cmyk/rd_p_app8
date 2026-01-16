import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Text,
    Image,
} from 'react-native';
import { theme } from '../theme';
import { images } from '../../assets/images';

interface SearchBarProps {
    onSearch: (query: string) => void;
    onClear: () => void;
    onChange?: (query: string) => void;
    placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    onClear,
    onChange,
    placeholder = 'Search for movies and series',
}) => {
    const [query, setQuery] = useState('');

    const handleChangeText = (text: string) => {
        setQuery(text);
        if (onChange) {
            onChange(text);
        }
    };

    const handleSearch = () => {
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    const handleClear = () => {
        setQuery('');
        onClear();
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Image source={images.SEARCH} style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    value={query}
                    onChangeText={handleChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.lightGray}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                    maxLength={20}
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                        <Text style={styles.clearText}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: theme.spacing.md,
        marginVertical: theme.spacing.sm,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.gray,
        borderRadius: theme.borderRadius.lg,
        paddingHorizontal: theme.spacing.md,
    },
    searchIcon: {
        width: 20,
        height: 20,
        marginRight: theme.spacing.sm,
        tintColor: theme.colors.white,
    },
    input: {
        flex: 1,
        color: theme.colors.white,
        fontSize: theme.typography.sizes.md,
        paddingVertical: theme.spacing.md,
    },
    clearButton: {
        padding: theme.spacing.xs,
    },
    clearText: {
        color: theme.colors.lightGray,
        fontSize: theme.typography.sizes.md,
    },
});
