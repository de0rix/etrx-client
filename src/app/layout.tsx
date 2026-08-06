import { Suspense, useId } from 'react';
import { Sidebar } from './components/sidebar';
import LanguageProvider from './components/language-provider';
import './globals.css';
import Header from './components/Header';
import GizmoSpinner from './components/gizmo-spinner';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const sidebarId = useId();

  return (
    <html>
      <title>ETRX</title>
      <body>
        <Suspense fallback={<GizmoSpinner />}>
          <Header />
          <LanguageProvider />
          <Sidebar sidebarId={sidebarId} />
          {children}
        </Suspense>
      </body>
    </html>
  );
}
