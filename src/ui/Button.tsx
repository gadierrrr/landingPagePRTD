import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses: Record<string,string> = {
  primary: 'bg-brand-red text-white hover:bg-brand-red/90',
  secondary: 'bg-brand-blue text-white hover:bg-brand-navy',
  outline: 'border border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white',
  danger: 'bg-error text-white hover:bg-error/90'
};
const sizeClasses: Record<string,string> = {
  sm: 'text-sm px-3 py-2',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-6 py-3'
};

export const Button: React.FC<ButtonProps> = ({ variant='primary', size='md', className='', ...rest }) => (
  <button className={`rounded-full font-bold shadow-md disabled:opacity-60 focus:outline-none focus-visible:shadow-focus transition ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...rest} />
);
