import "../styles/InfoSections.css";

export function HowItWorks({ steps }) {
  return (
    <section className="section section-alt">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Simple Process</span>
          <h2>How CleanNest Works</h2>
          <p>Three easy steps between you and a trusted local professional.</p>
        </div>

        <div className="steps-grid">
          {steps.map((step) => (
            <article key={step.number} className="step-card">
              <div className="step-number">{step.number}</div>
              <div className="step-icon" aria-hidden="true">
                {step.icon}
              </div>
              <h3>{step.title}</h3>
              <p className="muted">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyChoose({ benefits }) {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Why CleanNest</span>
          <h2>A marketplace you can trust</h2>
          <p>Built to make booking local services simple and transparent.</p>
        </div>

        <div className="benefits-grid">
          {benefits.map((b) => (
            <article key={b.title} className="benefit-card">
              <div className="benefit-icon" aria-hidden="true">
                {b.icon}
              </div>
              <h3>{b.title}</h3>
              <p className="muted">{b.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Stats({ stats }) {
  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-item">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBanner({ onBook }) {
  return (
    <section className="section">
      <div className="container">
        <div className="cta-banner">
          <div>
            <h2>Ready to book a trusted local pro?</h2>
            <p className="muted">
              Browse providers and book in just a few taps.
            </p>
          </div>
          <button className="btn btn-accent cta-btn" onClick={onBook}>
            Book a Service
          </button>
        </div>
      </div>
    </section>
  );
}
