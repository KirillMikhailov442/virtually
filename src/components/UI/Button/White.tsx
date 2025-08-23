import type { FC } from 'react';
import styles from './Button.module.scss';
import type { ButtonProps } from '.';
import { Tooltip } from 'antd';
import clsx from 'clsx';

const ButtonWhite: FC<ButtonProps> = ({
  children,
  title,
  className,
  size = 'md',
  ...props
}) => {
  return (
    <Tooltip mouseEnterDelay={0.5} title={title}>
      <button
        className={clsx(styles.default, styles.white, styles[size], className)}
        {...props}>
        {children}
      </button>
    </Tooltip>
  );
};

export default ButtonWhite;
