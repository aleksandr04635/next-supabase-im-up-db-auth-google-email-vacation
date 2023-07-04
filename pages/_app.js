// pages/_app.js
import { SessionProvider as AuthProvider } from 'next-auth/react';
// ...
import {Toaster} from 'react-hot-toast';
import '../styles/globals.css'


function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <>
      <AuthProvider session={session}>
        <Component {...pageProps} />
      </AuthProvider>
      
      <Toaster />
     </>
  );
}

export default MyApp;