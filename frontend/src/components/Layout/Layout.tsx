import { Sidebar } from './Sidebar';

interface ILayout {
  children: React.ReactNode;
}

export function Layout({ children }: ILayout) {
  return (
    <div className='flex h-screen overflow-hidden bg-background'>
      <Sidebar />
      <main className='flex-1 overflow-y-auto p-8'>{children}</main>
    </div>
  );
}
