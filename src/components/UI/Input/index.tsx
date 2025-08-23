import { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import InputText from './Text';
import InputNumber from './Number';

export { InputText };

export interface InputProps extends HTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'number' | 'password' | 'email' | 'date';
  label?: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  name?: string;
  placeholder?: string;
  readOnly?: boolean;
  value?: string;
}
const Input: FC<InputProps> = ({ type, ...props }) => {
  switch (type) {
    case 'text':
      return <InputText {...props} />;
    case 'number':
      return <InputNumber {...props} />;
    default:
      return <InputText {...props} />;
  }
};

export default Input;
