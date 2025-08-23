import type { FC } from 'react';
import styles from './Button.module.scss';
import type { ButtonProps } from '.';
import { Tooltip } from 'antd';
import clsx from 'clsx';

const ButtonDanger: FC<ButtonProps> = ({
  children,
  title,
  className,
  size = 'md',
  ...props
}) => {
  return (
    <Tooltip mouseEnterDelay={0.5} title={title}>
      <button
        className={clsx(styles.default, styles.danger, styles[size], className)}
        {...props}>
        {children}
      </button>
    </Tooltip>
  );
};

export default ButtonDanger;
