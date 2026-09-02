import Hero from '@/components/hero/Hero'
import IntroSection from '@/components/intro/IntroSection'
import NameStrip from '@/components/name/NameStrip'
import StudioSection from '@/components/studio/StudioSection'
import ConnectCard from '@/components/ui/ConnectCard'
import SiteFooter from '@/components/footer/SiteFooter'
import PaperRun from '@/components/paper/PaperRun'

/**
 * PAGE 01 — the cover
 * PAGE 02 — HELLO / education / skills / experience
 * PAGE 03 — the black sheet underneath
 * PAGE 04 — THE STU
 * PAGE 05 — the last page: LET'S CONNECT, and the paper tears away
 *
 * Sections are siblings sitting on one shared sheet. Adding SELECTED WORK,
 * PROCESS, EXPERIMENTS or CONTACT is a matter of dropping another section into
 * this list — nothing above it needs to change, and it inherits the paper.
 */
export default function Page() {
  return (
    <>
      <main>
        {/* One sheet of paper runs the height of the document. Sections are
            laid on it; the black page in NameStrip is a second sheet laid on
            top of that. */}
        <PaperRun>
          <Hero />
          <IntroSection />
          <NameStrip />
          <StudioSection />
          <SiteFooter />
        </PaperRun>
      </main>
      <ConnectCard />
    </>
  )
}
