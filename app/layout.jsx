import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Ahorra Ya · Panel inteligente de ahorro',
  description:
    'Diseña automatizaciones, estima resultados mensuales y recibe recomendaciones accionables para tus metas de ahorro.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
