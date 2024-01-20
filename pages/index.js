import Head from "next/head";
import Header from "@components/Header";
import Footer from "@components/Footer";
import StartGameButton from "@components/StartGameButton";

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Next.js Starter!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header title="Welcome to the treacherous!" />

        <p className="description">
          Are you ready to find out who the innocent are, and who the
          treacherous are?
        </p>

        <StartGameButton />
      </main>

      <Footer />
    </div>
  );
}
