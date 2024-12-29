import '@/app/ui/global.css';
import Link from 'next/link';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>whamo!</title>
        <link rel="icon" href="favicon.png" />
      </head>
      <body className="bg-gray-100">
        <div className="mx-auto max-w-4xl border-b border-gray-200 p-4">
          <div className="inline-block">
            <Link href="/">
              <span className="text-gray-600">whamo&nbsp;</span>
              <span className="text-purple-400">:)</span>
            </Link>
          </div>
          {/*
          <div className="inline-block mx-4 border-l border-gray-300">
            <ul className="flex">
              <li className="mr-6 px-4">
                <Link href="/goals" className="text-blue-500 hover:text-blue-800">Goals</Link>
              </li>
            </ul>
          </div>
          */}
        </div>
        {children}
      </body>
    </html>
  );
}
