import type { SelectHTMLAttributes } from 'react';
import { cx } from '../lib/cx';
import { Field } from './Field';
import styles from './controls.module.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ id, label, hint, error, options, className, ...rest }: SelectProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        className={cx(styles.control, styles.select, className)}
        aria-invalid={error ? true : undefined}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
