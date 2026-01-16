import React from "react";
import { StyleProp, Text, TextStyle } from 'react-native';

type TextViewProps = {
    children: React.ReactNode;
    fontSize: TextStyle['fontSize'];
    lineHeight?: TextStyle['lineHeight'];
    fontWeight: TextStyle['fontWeight'];
    color: TextStyle['color'];
    numberOfLines?: number | undefined;
    style?: StyleProp<TextStyle> | undefined;
};

export const TextView: React.FC<TextViewProps> = ({ children, fontSize, lineHeight, fontWeight, color, numberOfLines, style }) => {
    return (
        <Text
            style={[
                {
                    fontFamily: 'SF Pro',
                    fontWeight,
                    fontSize,
                    color,
                    lineHeight
                },
                style
            ]}
            numberOfLines={numberOfLines}>
            {children}
        </Text>
    );
};