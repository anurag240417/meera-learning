import React, { useCallback, useState } from 'react';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Benefits from './components/Benefits/Benefits';
import Programs from './components/Programs/Programs';
import RegistrationForm from './components/RegistrationForm/RegistrationForm';
import Faq from './components/Faq/Faq';
import Footer from './components/Footer/Footer';
import styles from './App.module.css';

export default function App() {
  // `nonce` lets the same program be re-selected after the user changed the dropdown.
  const [programRequest, setProgramRequest] = useState(null);

  const handleSelectProgram = useCallback((id) => {
    setProgramRequest({ id, nonce: Date.now() });
  }, []);

  return (
    <div id="top" className={styles.page}>
      <a className={styles.skipLink} href="#main">Skip to main content</a>
      <Header />
      <main id="main" tabIndex={-1} className={styles.main}>
        <Hero />
        <Benefits />
        <Programs onSelectProgram={handleSelectProgram} />
        <RegistrationForm programRequest={programRequest} />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
