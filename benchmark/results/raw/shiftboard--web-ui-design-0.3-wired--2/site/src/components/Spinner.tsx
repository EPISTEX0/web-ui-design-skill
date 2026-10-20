import { cx } from '../lib/cx';
import styles from './Spinner.module.css';

interface SpinnerProps {
  label?: string;
  className?: string;
}

export function Spinner({ label = 'Loading', className }: SpinnerProps) {
  return <span className={cx(styles.spinner, className)} role="status" aria-label={label} />;
}
