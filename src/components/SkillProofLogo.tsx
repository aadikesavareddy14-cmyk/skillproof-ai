import React from 'react';
import logoImg from '@/assets/skillproof-ai-logo.jpg';

export interface SkillProofLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 'xs' | 'sm' | 'navbar' | 'md' | 'auth' | 'lg' | 'xl' | number;
  variant?: 'cube' | 'lockup' | 'full' | string;
  layout?: 'horizontal' | 'vertical' | string;
  animated?: boolean;
  className?: string;
}

const sizeClasses: Record<string, string> = {
  xs: 'h-8 w-8',
  sm: 'h-9 w-9',
  navbar: 'h-10 sm:h-11 w-10 sm:w-11',
  md: 'h-14 w-14',
  lg: 'h-20 w-20',
  auth: 'h-24 sm:h-28 w-24 sm:w-28',
  xl: 'h-32 w-32',
};

export function SkillProofLogo({
  size = 'navbar',
  variant: _variant,
  layout: _layout,
  animated = false,
  className = '',
  style,
  alt = 'SkillProof AI — Prove Skills',
  ...props
}: SkillProofLogoProps) {
  const isCustomSize = typeof size === 'number';
  const sizeClass = !isCustomSize ? sizeClasses[size] || sizeClasses.navbar : '';

  return (
    <img
      src={logoImg}
      alt={alt}
      loading="eager"
      decoding="async"
      className={`object-contain select-none mix-blend-screen shrink-0 transition-transform duration-300 ${
        animated ? 'animate-pulse' : ''
      } ${sizeClass} ${className}`}
      style={{
        ...(isCustomSize ? { height: `${size}px`, width: `${size}px` } : {}),
        aspectRatio: '1 / 1',
        ...style,
      }}
      {...props}
    />
  );
}

// Re-export for compatibility with any existing imports
export const SkillProofCube = ({
  size = 34,
  className = '',
  animated = false,
}: {
  size?: number | string;
  className?: string;
  animated?: boolean;
}) => {
  return (
    <SkillProofLogo
      size={typeof size === 'number' ? size : 34}
      animated={animated}
      className={className}
    />
  );
};

