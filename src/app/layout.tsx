import type { Metadata } from 'next';
import { Prompt, Kanit } from 'next/font/google';
import { Providers } from './providers';
import Header from './components/Header';
import '../../node_modules/flag-icons/css/flag-icons.min.css';
import './globals.css';

import { NextIntlClientProvider } from 'next-intl';
// import Footer from './components/Footer';

const prompt = Prompt({
    subsets: ['latin', 'thai'],
    weight: ['400', '500', '600']
});

// const kanit = Kanit({
//     subsets: ['latin', 'thai'],
//     weight: ['400', '500', '600']
// });

export const metadata: Metadata = {
    title: 'ThailandCube',
    description: 'A web application from ThailandCube',
};

export default async function RootLayout({children}: Readonly<{children: React.ReactNode}>) 
{
    return (
        <html lang='en' className='light'>
            <body className={`${prompt.className} antialiased`}>
                <NextIntlClientProvider>
                    <Providers>
                        <Header/>
                        <div className='mt-5'>
                            {children}
                        </div>
                        {/* <Footer/> */}
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
