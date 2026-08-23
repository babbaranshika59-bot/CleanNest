import { useEffect } from "react";
import { HowItWorks, WhyChoose, Stats, CtaBanner } from "../components/InfoSections.jsx";
import { useBookingModals } from "../hooks/useBookingModals.jsx";
import { providers, stats, benefits, steps } from "../data/sampleData.js";

export default function HowItWorksPage() {
  const { openBooking, modals } = useBookingModals();

  useEffect(() => {
    document.title = "How It Works — CleanNest";
  }, []);

  return (
    <div className="page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">How It Works</span>
          <h1>Book a local pro in 3 simple steps</h1>
          <p className="muted">
            CleanNest makes it easy to go from needing a service to having a trusted
            professional at your door.
          </p>
        </div>
      </section>

      <HowItWorks steps={steps} />
      <WhyChoose benefits={benefits} />
      <Stats stats={stats} />
      <CtaBanner onBook={() => openBooking(providers[0])} />

      {modals}
    </div>
  );
}
