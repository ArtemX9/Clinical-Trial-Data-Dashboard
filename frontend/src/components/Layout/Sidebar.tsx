import { ActivitySquare, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/pages/routes';
import { cn } from '@/utils/cn';

interface INavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: INavItem[] = [
  { to: ROUTES.participants, label: 'Participants', icon: <Users className='h-4 w-4' /> },
  { to: ROUTES.metrics, label: 'Metrics', icon: <ActivitySquare className='h-4 w-4' /> },
];

export function Sidebar() {
  const { username, signOut } = useAuth();

  return (
    <aside className='flex h-screen w-60 flex-col border-r border-border bg-white'>
      {renderHeader()}
      {renderNav()}
      {renderFooter()}
    </aside>
  );

  function renderHeader() {
    return (
      <div className='flex items-center gap-2 border-b border-border px-6 py-5'>
        <LayoutDashboard className='h-5 w-5 text-primary' />
        <span className='text-sm font-semibold text-foreground'>Trial Dashboard</span>
      </div>
    );
  }

  function renderNav() {
    return (
      <nav className='flex flex-1 flex-col gap-1 px-3 py-4'>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    );
  }

  function renderFooter() {
    return (
      <div className='border-t border-border px-3 py-4'>
        <div className='mb-2 px-3 text-xs text-muted-foreground'>{username}</div>
        <Button
          variant='ghost'
          size='sm'
          className='w-full justify-start gap-3 text-muted-foreground hover:text-destructive'
          onClick={signOut}
        >
          <LogOut className='h-4 w-4' />
          Sign out
        </Button>
      </div>
    );
  }
}
