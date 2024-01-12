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
      <body>{children}</body>
    </html>
  );
}
