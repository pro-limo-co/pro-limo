import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Trust } from "@/components/Trust";
import { Services } from "@/components/Services";
import { Fleet } from "@/components/Fleet";
import { Experience } from "@/components/Experience";
import { Cities } from "@/components/Cities";
import { Standards } from "@/components/Standards";
import { Testimonial } from "@/components/Testimonial";
import { AppCTA } from "@/components/AppCTA";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { homePageSchemas } from "@/lib/schema";

export default function Home() {
  return (
    <>
      <JsonLd data={homePageSchemas} />
      <Nav />
      <main>
        <Hero />
        <Trust />
        <Services />
        <Fleet />
        <Experience />
        <Cities />
        <Standards />
        <Testimonial />
        <AppCTA />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
