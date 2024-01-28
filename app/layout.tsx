import '@/app/ui/global.css';

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
      <body className="bg-gray-100 text-gray-700">{children}</body>
    </html>
  );
}
