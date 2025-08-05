import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'ポケテニマスター',
  description: 'ポケモンテニス部育成シミュレーションゲーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="h-full">
      <body className="h-full">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
