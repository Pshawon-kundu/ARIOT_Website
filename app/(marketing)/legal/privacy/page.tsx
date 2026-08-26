import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/legal-page';
import { defineMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = defineMetadata({
  title: 'Privacy policy',
  description: 'ARIOT privacy policy — how we collect, use, and protect personal data.',
  path: '/legal/privacy',
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      lastUpdated="[DATE PENDING — awaiting legal review]"
      sections={[
        {
          heading: 'Introduction',
          body: '[ARIOT ("we", "our", "us") is committed to protecting the personal data of anyone who interacts with our website and products. This privacy policy describes how we collect, use, and safeguard your data. It is a pre-commercial placeholder and will be replaced by a policy reviewed and approved by qualified legal counsel before ARIOT begins commercial operations.]',
        },
        {
          heading: 'Data we collect',
          body: '[We may collect: contact information submitted via our contact and quote forms (name, email, company, phone); newsletter subscription email addresses; website usage data via analytics (aggregated, no personally identifiable tracking without consent); IP address data for security and rate-limiting purposes. We do not collect payment card data on this site.]',
        },
        {
          heading: 'How we use your data',
          body: '[We use your data to: respond to quote and contact requests; send newsletters to subscribers who opted in; improve the website based on aggregated analytics; protect the site from abuse via rate-limiting. We do not sell your personal data to third parties.]',
        },
        {
          heading: 'Data retention',
          body: "[Contact and quote form submissions are retained for [PERIOD PENDING] to allow follow-up and service delivery. Newsletter subscriptions are retained until you unsubscribe. Website analytics data is retained per the analytics provider's data retention policy.]",
        },
        {
          heading: 'Your rights',
          body: '[Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict processing of your personal data. To exercise any of these rights, contact us at [PRIVACY EMAIL PENDING]. We will respond within [RESPONSE PERIOD PENDING].]',
        },
        {
          heading: 'Cookies',
          body: '[We use cookies and similar technologies for analytics and session management. See our Cookie Policy for details.]',
        },
        {
          heading: 'Contact',
          body: '[For privacy questions: [PRIVACY EMAIL PENDING]. ARIOT, [ADDRESS PENDING], Bangladesh.]',
        },
      ]}
    />
  );
}
