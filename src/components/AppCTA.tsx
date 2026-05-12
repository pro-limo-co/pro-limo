import { Reveal } from "./Reveal";

export function AppCTA() {
  return (
    <section id="app" className="section relative overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow">Chapter VIII - In your pocket</p>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="display-lg mt-5">
                Reserve in three taps,
                <br />
                <span className="italic text-[color:var(--color-champagne-bright)]">manage on the move.</span>
              </h2>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-7 max-w-xl text-[1.025rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
                Live arrival map. Chauffeur identity card. Saved trips and
                preferences. Receipts auto-routed to your business account. The
                Professional Limousine Driver app keeps your travel as quiet as your driver does.
              </p>
            </Reveal>

            <Reveal delay={360}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a href="#ios" className="store-badge group">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M16.4 12.7c0-2.3 1.9-3.4 1.9-3.4-1-1.5-2.7-1.7-3.3-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.7 1.1 8.9.7 1.1 1.6 2.3 2.8 2.2 1.1 0 1.6-.7 2.9-.7 1.4 0 1.7.7 2.9.7 1.2 0 2-1.1 2.7-2.2.6-.9 1.2-2 1.4-2.5-1-.4-2.3-1.5-2.3-3.6zm-2.7-6.7c.6-.7 1-1.7 1-2.7-.9 0-2 .6-2.6 1.3-.6.6-1.1 1.6-1 2.6 1 .1 2-.5 2.6-1.2z" />
                  </svg>
                  <span>
                    <small>Download on the</small>
                    <strong>App Store</strong>
                  </span>
                </a>
                <a href="#android" className="store-badge group">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M3.6 2.5l9 9-9 9c-.4-.2-.6-.6-.6-1V3.5c0-.4.2-.8.6-1zm10.7 10l2.7 2.7-9.6 5.6 6.9-8.3zm0-2L7.4 2.2 17 7.8l-2.7 2.7zm6.4 1c.5.3.8.8.8 1.4s-.3 1.1-.8 1.4l-2.6 1.5-3-3 3-3 2.6 1.7z" />
                  </svg>
                  <span>
                    <small>Get it on</small>
                    <strong>Google Play</strong>
                  </span>
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={400} className="lg:col-span-5 flex justify-center lg:justify-end">
            <PhoneMock />
          </Reveal>
        </div>
      </div>

      <style>{`
        .store-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1.4rem;
          border-radius: 999px;
          background: var(--color-bone);
          color: var(--color-ink);
          transition: background 320ms var(--ease-stage), transform 320ms var(--ease-stage);
        }
        .store-badge:hover { background: var(--color-champagne-bright); transform: translateY(-1px); }
        .store-badge span { display:flex; flex-direction:column; line-height:1.05; }
        .store-badge small { font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase; opacity:0.7; }
        .store-badge strong { font-family: var(--font-display); font-weight: 500; font-size: 1.125rem; }
      `}</style>
    </section>
  );
}

function PhoneMock() {
  return (
    <div
      className="relative w-[280px] h-[560px] rounded-[44px] p-2 surface-raised shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)]"
      style={{ transform: "rotate(-3deg)" }}
    >
      <div className="absolute inset-x-12 top-0 h-6 rounded-b-2xl bg-[color:var(--color-ink)] z-10" />
      <div className="relative h-full w-full rounded-[36px] overflow-hidden bg-gradient-to-b from-[color:var(--color-ink-soft)] via-[color:var(--color-ink)] to-[color:var(--color-ink)] grain">
        <div className="px-6 pt-10 pb-4 flex items-center justify-between">
          <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[color:var(--color-bone-dim)]">
            21:14 · Portland
          </span>
          <span className="inline-flex size-2 rounded-full bg-[color:var(--color-champagne)]" />
        </div>

        <div className="px-6 mt-2">
          <p className="font-mono text-[0.6rem] tracking-[0.22em] uppercase text-[color:var(--color-pewter)]">
            Tonight · 22:00
          </p>
          <h4 className="font-display text-[1.45rem] leading-tight mt-2 text-[color:var(--color-bone)]">
            PDX arrivals to Lake Oswego
          </h4>
          <p className="mt-1 text-[0.78rem] text-[color:var(--color-bone-dim)]">
            Flight AS 342 · 21:48 ETA
          </p>
        </div>

        {/* Map */}
        <div className="mx-4 mt-5 h-[200px] rounded-2xl border border-[color:var(--color-divider)] bg-[color:var(--color-ink-soft)] relative overflow-hidden">
          <svg viewBox="0 0 280 200" className="absolute inset-0 w-full h-full" aria-hidden>
            {Array.from({ length: 7 }).map((_, i) => (
              <path
                key={i}
                d={`M${-20 + i * 50} 0 L${80 + i * 50} 200`}
                stroke="#2A2823"
                strokeWidth="1"
                fill="none"
              />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <path
                key={`h${i}`}
                d={`M0 ${30 + i * 38} L280 ${30 + i * 38}`}
                stroke="#2A2823"
                strokeWidth="1"
                fill="none"
              />
            ))}
            <path
              d="M30 170 C 70 130 110 110 150 100 S 230 60 260 30"
              stroke="#C8A96A"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="30" cy="170" r="5" fill="#C8A96A" />
            <circle cx="260" cy="30" r="5" fill="#F2EEE5" />
          </svg>
        </div>

        {/* Chauffeur card */}
        <div className="mx-4 mt-4 rounded-2xl border border-[color:var(--color-divider)] bg-[color:var(--color-ink-raised)] p-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 rounded-full bg-[color:var(--color-champagne)]/15 items-center justify-center font-display text-[1rem] text-[color:var(--color-champagne-bright)]">
              MA
            </span>
            <div className="flex-1">
              <p className="text-[0.85rem] text-[color:var(--color-bone)]">Marc A.</p>
              <p className="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-[color:var(--color-pewter)]">
                S-Class · LX17 PRO
              </p>
            </div>
            <span className="font-mono text-[0.62rem] tracking-[0.18em] text-[color:var(--color-champagne)]">
              5★ · 2,481
            </span>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-4 px-4">
          <button className="btn btn-primary !h-11 w-full !text-[0.72rem]">
            Track arrival
          </button>
        </div>
      </div>
    </div>
  );
}
