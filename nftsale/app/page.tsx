import { Hero } from '@/components/sections/hero';
import { NFTBenefits } from '@/components/sections/nft-benefits';
import { HowMintWorks } from '@/components/sections/how-mint-works';
import { FundingGoals } from '@/components/sections/funding-goals';
import { SocialProof } from '@/components/sections/social-proof';
import { EventsPreview } from '@/components/sections/events-preview';
import { UpdatesPreview } from '@/components/sections/updates-preview';
import { FAQPreview } from '@/components/sections/faq-preview';
import { EmailCapture } from '@/components/sections/email-capture';

export default function Home() {
  return (
    <main className="min-h-screen bg-cs-bg">
      <Hero />
      <NFTBenefits />
      <SocialProof />
      <HowMintWorks />
      <FundingGoals />
      <EventsPreview />
      <UpdatesPreview />
      <FAQPreview />
      <EmailCapture />
    </main>
  );
}