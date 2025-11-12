import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';

interface CryptoIconProps {
  code: string;
  size?: number;
  style?: any;
}

/**
 * CryptoIcon Component
 *
 * Displays official crypto asset icons for XLM and USDC
 * Uses SVG for crisp, scalable icons
 */
const CryptoIcon: React.FC<CryptoIconProps> = ({ code, size = 32, style }) => {
  // XLM - Stellar Lumens (Black with white rocket/star)
  if (code === 'XLM') {
    return (
      <View style={style}>
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Circle cx="16" cy="16" r="16" fill="#000000" />
          <G transform="translate(8, 8)">
            <Path
              d="M8 0L0 4.5V13.5L8 18L16 13.5V4.5L8 0Z"
              fill="#FFFFFF"
            />
            <Path
              d="M8 4L4 6.5V11.5L8 14L12 11.5V6.5L8 4Z"
              fill="#000000"
            />
          </G>
        </Svg>
      </View>
    );
  }

  // USDC - USD Coin (Circle blue with dollar sign)
  if (code === 'USDC') {
    return (
      <View style={style}>
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Circle cx="16" cy="16" r="16" fill="#2775CA" />
          <Path
            d="M20 13C20 11.3431 18.6569 10 17 10H15C13.3431 10 12 11.3431 12 13C12 14.6569 13.3431 16 15 16H17C18.6569 16 20 17.3431 20 19C20 20.6569 18.6569 22 17 22H15C13.3431 22 12 20.6569 12 19M16 8V10M16 22V24"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </View>
    );
  }

  // Default fallback - gray circle with question mark
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Circle cx="16" cy="16" r="16" fill="#8E8E93" />
        <Path
          d="M16 22C16.5523 22 17 21.5523 17 21C17 20.4477 16.5523 20 16 20C15.4477 20 15 20.4477 15 21C15 21.5523 15.4477 22 16 22Z"
          fill="white"
        />
        <Path
          d="M16 18V17C16 15.3431 17.3431 14 19 14C19.5523 14 20 13.5523 20 13C20 12.4477 19.5523 12 19 12H15"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
};

export default CryptoIcon;
