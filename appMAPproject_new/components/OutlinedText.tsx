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
  strokeWidth = 3,
  textColor,
  numberOfLines,
  ...rest
}: OutlinedTextProps) {
  const flatStyle = StyleSheet.flatten(style) || {};
  const mainColor = textColor || flatStyle.color || Colors.freshlyRoasted;

  // 12 direction offsets for thick white stroke outline & glow effect
  const w = strokeWidth;
  const offsets = [
    { x: -w, y: -w },
    { x: 0, y: -w },
    { x: w, y: -w },
    { x: -w, y: 0 },
    { x: w, y: 0 },
    { x: -w, y: w },
    { x: 0, y: w },
    { x: w, y: w },
    { x: -w * 0.5, y: -w * 0.5 },
    { x: w * 0.5, y: -w * 0.5 },
    { x: -w * 0.5, y: w * 0.5 },
    { x: w * 0.5, y: w * 0.5 },
  ];

  return (
    <View style={{ position: 'relative' }}>
      {offsets.map((offset, index) => (
        <Text
          key={index}
          numberOfLines={numberOfLines}
          {...rest}
          style={[
            style,
            {
              position: 'absolute',
              left: offset.x,
              top: offset.y,
              color: strokeColor,
              textShadowColor: strokeColor,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 8,
            },
          ]}
        >
          {text}
        </Text>
      ))}
      <Text
        numberOfLines={numberOfLines}
        {...rest}
        style={[
          style,
          {
            color: mainColor,
            textShadowColor: 'rgba(255, 255, 255, 0.9)',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 6,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}
