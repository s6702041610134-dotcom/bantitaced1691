import React from 'react';
import { Text, View, StyleSheet, TextStyle, TextProps } from 'react-native';
import { Colors } from '../../constants/Colors';

interface OutlinedTextProps extends TextProps {
  text: string;
  style?: TextStyle | TextStyle[];
  strokeColor?: string;
  strokeWidth?: number;
  textColor?: string;
}

export function OutlinedText({
  text,
  style,
  strokeColor = '#FFFFFF',
  strokeWidth = 0,
  textColor,
  numberOfLines,
  ...rest
}: OutlinedTextProps) {
  const flatStyle = StyleSheet.flatten(style) || {};
  const mainColor = textColor || flatStyle.color || Colors.freshlyRoasted;

  if (!strokeWidth || strokeWidth <= 0) {
    return (
      <Text
        numberOfLines={numberOfLines}
        {...rest}
        style={[style, { color: mainColor }]}
      >
        {text}
      </Text>
    );
  }

  return (
    <Text
      numberOfLines={numberOfLines}
      {...rest}
      style={[
        style,
        {
          color: mainColor,
          textShadowColor: strokeColor,
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: Math.min(strokeWidth * 1.5, 4),
        },
      ]}
    >
      {text}
    </Text>
  );
}
