import { useEffect } from "react";
import { Stats, WhyChoose } from "../components/InfoSections.jsx";
import { Link } from "../router/Router.jsx";
import { stats, benefits, categories } from "../data/sampleData.js";
import "../styles/Page.css";

export default function AboutPage() {
  useEffect(() => {
    document.title = "About — CleanNest";
  }, []);

  return (
    <div className="page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">About</span>
          <h1>Bringing trusted local services to every doorstep</h1>
          <p className="muted">
            CleanNest is a local home-services platform that helps people discover and
            book reliable professionals for everyday household needs.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <div className="about-text">
            <h2>Our mission</h2>
            <p className="muted">
              We want to make finding trustworthy local help as simple as a few taps.
              Whether it's a deep clean, a quick repair, or a fresh coat of paint,
              CleanNest connects you with skilled professionals in your area.
            </p>
            <h2>What we offer</h2>
            <p className="muted">
              A curated directory of service providers across cleaning, salon, repairs,
              painting and plumbing — with clear pricing, ratings and availability so you
              can choose with confidence.
            </p>
            {/* <h2>Built as a student project</h2> */}
            {/* <p className="muted">
              This is Stage 1 of a three-stage academic project. The current version is a
              frontend prototype with sample data and a simulated booking experience.
              Real accounts, payments and live booking are reserved for later stages.
            </p> */}
            <Link to="/services" className="btn btn-primary">
              Explore services
            </Link>
          </div>

          <aside className="about-side">
            <div className="about-card">
              <h3>Service categories</h3>
              <ul className="about-categories">
                {categories.map((c) => (
                  <li key={c.id}>
                    <span aria-hidden="true">{c.icon}</span> {c.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="about-card about-contact">
              <h3>Contact</h3>
              <p className="muted">Email: hello@cleannest.example</p>
              <p className="muted">Phone: +91 98765 43210</p>
              <p className="muted">Hours: Mon–Sat, 9 AM – 7 PM</p>
            </div>
          </aside>
        </div>
      </section>

      <WhyChoose benefits={benefits} />
      <Stats stats={stats} />
    </div>
  );
}
