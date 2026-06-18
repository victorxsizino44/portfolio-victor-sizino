import AboutHighlights from "./AboutHighlights";
import AboutTimeline from "./AboutTimeline";
import AboutWorkStyle from "./AboutWorkStyle";

export default function AboutJourney() {
  return (
    <section className="mx-auto grid max-w-[1096px] gap-8 border-b border-line px-5 py-9 md:px-8 lg:grid-cols-[1fr_1.22fr_1fr]">
      <AboutTimeline />
      <AboutWorkStyle />
      <AboutHighlights />
    </section>
  );
}
