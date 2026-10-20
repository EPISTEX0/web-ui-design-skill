import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cx } from '../lib/cx';
import styles from './Table.module.css';

export function Table({ className, children, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className={styles.scroll}>
      <table className={cx(styles.table, className)} {...rest}>
        {children}
      </table>
    </div>
  );
}

export function TableHead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}

export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function TableRow({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cx(styles.row, className)} {...rest} />;
}

interface CellProps {
  numeric?: boolean;
}

export function TableHeaderCell({ numeric, className, ...rest }: ThHTMLAttributes<HTMLTableCellElement> & CellProps) {
  return <th className={cx(styles.th, numeric && styles.numeric, className)} {...rest} />;
}

export function TableCell({ numeric, className, ...rest }: TdHTMLAttributes<HTMLTableCellElement> & CellProps) {
  return <td className={cx(styles.td, numeric && styles.numeric, className)} {...rest} />;
}
