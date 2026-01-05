import { ReactNode } from 'react';

// Simplified layout for persistent meeting room - no sidebar/navbar
const RootLayout = ({ children }: Readonly<{children: ReactNode}>) => {
  return (
    <main className="relative h-screen w-full bg-dark-2">
      {children}
    </main>
  );
};

export default RootLayout;
