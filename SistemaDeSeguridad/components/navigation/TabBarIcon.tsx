import Ionicons from '@expo/vector-icons/Ionicons';
import { type IconProps } from '@expo/vector-icons/build/createIconSet';
import { type ComponentProps } from 'react';

interface TabBarIconProps extends IconProps<ComponentProps<typeof Ionicons>['name']> {
  focused?: boolean;
  color?: string;
}

export function TabBarIcon({ focused, color, style, ...rest }: TabBarIconProps) {
  return (
    <Ionicons
      size={28}
      color={focused ? color : '#ccc'} 
      style={[{ marginBottom: -3 }, style]}
      {...rest}
    />
  );
}
