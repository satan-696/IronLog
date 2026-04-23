// web/src/components/Layout.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Calendar, Dumbbell, BarChart2, TrendingUp, UtensilsCrossed, User, LogOut, Scale
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import Avatar from './ui/Avatar.jsx';

const NAV_ITEMS = [
  { to: '/home',      icon: Home,           label: 'Home'      },
  { to: '/schedule',  icon: Calendar,       label: 'Schedule'  },
  { to: '/exercises', icon: Dumbbell,       label: 'Exercises' },
  { to: '/track',     icon: BarChart2,      label: 'Track'     },
  { to: '/reports',   icon: TrendingUp,     label: 'Reports'   },
  { to: '/meals',     icon: UtensilsCrossed,label: 'Meals', mealOnly: true },
  { to: '/weight',    icon: Scale,          label: 'Weight'    },
  { to: '/profile',   icon: User,           label: 'Profile'   },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = NAV_ITEMS.filter(item => !item.mealOnly || user?.mealTrackingEnabled);

  return (
    <div className="flex min-h-screen bg-bg">
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-surface border-r border-border z-40">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-border">
          <span className="font-display text-3xl logo-text tracking-wider">IRONLOG</span>
          <p className="text-textMuted text-xs font-body mt-0.5">Plan. Lift. Evolve.</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium font-body transition-all',
                  isActive
                    ? 'bg-accent/15 text-accent border border-accent/30'
                    : 'text-text2 hover:text-text1 hover:bg-surface2',
                ].join(' ')
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar name={user?.name || ''} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-text1 text-sm font-medium font-body truncate">{user?.name}</p>
              <p className="text-textMuted text-xs font-body truncate">@{user?.username}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-text2 hover:text-danger transition-colors p-1"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 md:ml-60 min-h-screen pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          {children}
        </div>
      </main>

      {/* ── Bottom tab bar (mobile) ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-surface border-t border-border z-40 flex">
        {navItems.slice(0, 6).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-[10px] font-body transition-colors',
                isActive ? 'text-accent' : 'text-textMuted hover:text-text2',
              ].join(' ')
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
