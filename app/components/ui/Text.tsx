'use client';

import React, { ReactNode } from 'react';
import { useTheme } from './ThemeProvider';
import { twMerge } from 'tailwind-merge';

interface TextProps {
  variant?: 'heading' | 'body' | 'subtitle' | 'caption';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  className?: string;
  children: ReactNode;
}

export default function Text({
  variant = 'body',
  as: Component = 'p',
  className = '',
  children,
  ...rest
}: TextProps) {
  const { applyTextStyles } = useTheme();

  const baseStyles = applyTextStyles(variant);
  const variantStyles = getVariantStyles(variant, Component);
  const mergedClassName = twMerge(baseStyles, variantStyles, className);

  return (
    <Component className={mergedClassName} {...rest}>
      {children}
    </Component>
  );
}

// Helper function to get styles based on variant and component type
function getVariantStyles(variant: TextProps['variant'], component: TextProps['as']): string {
  // Base styling for each variant
  switch (variant) {
    case 'heading':
      if (component === 'h1') return 'text-3xl font-bold';
      if (component === 'h2') return 'text-2xl font-bold';
      if (component === 'h3') return 'text-xl font-bold';
      if (component === 'h4') return 'text-lg font-bold';
      return 'text-lg font-semibold';
      
    case 'subtitle':
      return 'text-base font-medium';
      
    case 'caption':
      return 'text-sm';
      
    case 'body':
    default:
      return 'text-base leading-relaxed';
  }
}