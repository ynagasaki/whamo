import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <ul>
          <li><Link href="/goals/1/view">Goal 1</Link></li>
          <li><Link href="/goals/2/view">Goal 2</Link></li>
        </ul>
      </div>
      <div className="flex-grow md:overflow-y-auto">{children}</div>
    </div>
  );
}
