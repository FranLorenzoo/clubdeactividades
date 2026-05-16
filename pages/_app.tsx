import "@/pages/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (<>
    <head>
       <title>Club360</title>
    </head>
    <Component {...pageProps} />;
  </>);

}