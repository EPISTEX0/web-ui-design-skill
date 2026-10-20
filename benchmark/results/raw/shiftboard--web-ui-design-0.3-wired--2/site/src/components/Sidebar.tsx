import { NavLink } from 'react-router-dom';
import { cx } from '../lib/cx';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import styles from './Sidebar.module.css';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Schedule', icon: 'calendar' },
  { to: '/staff', label: 'Staff', icon: 'users' },
  { to: '/time-off', label: 'Time off', icon: 'clock' },
];

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.mark} aria-hidden="true">
          S
        </span>
        <span className={styles.name}>Shiftboard</span>
      </div>
      <nav aria-label="Main">
        <ul className={styles.list}>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => cx(styles.link, isActive && styles.active)}
              >
                <Icon name={item.icon} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.user}>
        <span className={styles.avatar} aria-hidden="true">
          DW
        </span>
        <div>
          <p className={styles.userName}>Dana Whitlock</p>
          <p className={styles.userRole}>Quayside</p>
        </div>
      </div>
    </aside>
  );
}
