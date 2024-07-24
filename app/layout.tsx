import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';

// ルートレイアウト。全てのページで共有される
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* <body>{children}</body> */}
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
