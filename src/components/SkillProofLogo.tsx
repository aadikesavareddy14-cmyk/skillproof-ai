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
  xs: 'h-8 max-w-[100px]',
  sm: 'h-9 max-w-[110px]',
  navbar: 'h-11 max-w-[140px]',
  md: 'h-14 max-w-[170px]',
  lg: 'h-20 max-w-[240px]',
  auth: 'h-32 sm:h-36 max-w-[280px]',
  xl: 'h-40 max-w-[320px]',
};

export function SkillProofLogo({
  size = 'navbar',
  variant,
  layout,
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
        ...(isCustomSize ? { height: `${size}px`, width: 'auto' } : {}),
        aspectRatio: '860 / 696',
        ...style,
      }}
      {...props}
    />
  );
}

// Re-export for compatibility with any existing imports
export const SkillProofCube = ({
  size = 36,
  className = '',
  animated = false,
}: {
  size?: number | string;
  className?: string;
  animated?: boolean;
}) => {
  return (
    <SkillProofLogo
      size={typeof size === 'number' ? size : 36}
      animated={animated}
      className={className}
    />
  );
};
