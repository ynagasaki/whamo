import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col bg-gray-100 p-4 pb-8">
      {children}
    </main>
  );
}
