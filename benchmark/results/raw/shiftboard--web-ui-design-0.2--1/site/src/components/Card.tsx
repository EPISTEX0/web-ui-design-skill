import type { ReactNode } from 'react';
import { cx } from '../lib/cx';
import styles from './Card.module.css';

interface CardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  flush?: boolean;
  className?: string;
  children: ReactNode;
}

export function Card({ title, description, actions, flush = false, className, children }: CardProps) {
  return (
    <section className={cx(styles.card, className)}>
      {title || actions ? (
        <header className={styles.header}>
          <div>
            {title ? <h2 className={styles.title}>{title}</h2> : null}
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </header>
      ) : null}
      <div className={flush ? styles.flush : styles.body}>{children}</div>
    </section>
  );
}
