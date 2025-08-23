import { FC, HTMLAttributes, ReactNode } from 'react';
import ButtonBlack from './Black';
import ButtonDanger from './Danger';

export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: 'black' | 'danger';
  size?: 'md' | 'sm';
  label?: string;
  children?: ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
}

const Button: FC<ButtonProps> = ({ variant, ...props }) => {
  switch (variant) {
    case 'black':
      return <ButtonBlack {...props} />;
    case 'danger':
      return <ButtonDanger {...props} />;
    default:
      return <ButtonBlack {...props} />;
  }
};

export default Button;
