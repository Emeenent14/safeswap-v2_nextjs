import { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Shield, Scale, Users, AlertTriangle } from 'lucide-react'
import { APP_CONFIG, DEAL_CONFIG, SAVINGS_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'SafeSwap Terms of Service - Rules and conditions for using our secure escrow platform',
  robots: 'index, follow'
}

export default function TermsOfServicePage() {
  const lastUpdated = '2025-08-27'
  const effectiveDate = '2025-09-01'

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scale className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Terms of Service
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            These terms govern your use of SafeSwap&apos;s secure escrow and savings platform. 
            Please read them carefully before using our services.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
            <span>Last updated: {new Date(lastUpdated).toLocaleDateString()}</span>
            <span>•</span>
            <span>Effective: {new Date(effectiveDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Quick Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Quick Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <Link href="#acceptance" className="text-blue-600 hover:text-blue-800 hover:underline">
                1. Acceptance of Terms
              </Link>
              <Link href="#services" className="text-blue-600 hover:text-blue-800 hover:underline">
                2. Service Description
              </Link>
              <Link href="#accounts" className="text-blue-600 hover:text-blue-800 hover:underline">
                3. User Accounts
              </Link>
              <Link href="#escrow" className="text-blue-600 hover:text-blue-800 hover:underline">
                4. Escrow Services
              </Link>
              <Link href="#savings" className="text-blue-600 hover:text-blue-800 hover:underline">
                5. Savings Features
              </Link>
              <Link href="#fees" className="text-blue-600 hover:text-blue-800 hover:underline">
                6. Fees and Payments
              </Link>
              <Link href="#conduct" className="text-blue-600 hover:text-blue-800 hover:underline">
                7. User Conduct
              </Link>
              <Link href="#disputes" className="text-blue-600 hover:text-blue-800 hover:underline">
                8. Dispute Resolution
              </Link>
              <Link href="#liability" className="text-blue-600 hover:text-blue-800 hover:underline">
                9. Limitation of Liability
              </Link>
              <Link href="#termination" className="text-blue-600 hover:text-blue-800 hover:underline">
                10. Account Termination
              </Link>
              <Link href="#changes" className="text-blue-600 hover:text-blue-800 hover:underline">
                11. Changes to Terms
              </Link>
              <Link href="#contact" className="text-blue-600 hover:text-blue-800 hover:underline">
                12. Contact Information
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Terms Content */}
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
          
          {/* Section 1: Acceptance */}
          <section id="acceptance" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
              Acceptance of Terms
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                By accessing and using {APP_CONFIG.name} (&quot;the Service&quot;, &quot;Platform&quot;, or &quot;we&quot;), 
                you accept and agree to be bound by these Terms of Service (&quot;Terms&quot;). 
                If you do not agree to these Terms, you may not use our Service.
              </p>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                These Terms constitute a legally binding agreement between you (&quot;User&quot;, &quot;you&quot;, or &quot;your&quot;) 
                and {APP_CONFIG.name}. By creating an account or using our services, you represent that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                <li>You are at least 18 years of age or the age of majority in your jurisdiction</li>
                <li>You have the legal capacity to enter into this agreement</li>
                <li>You will comply with all applicable laws and regulations</li>
                <li>All information you provide is accurate and truthful</li>
              </ul>
            </div>
          </section>

          {/* Section 2: Services */}
          <section id="services" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
              Service Description
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {APP_CONFIG.name} provides a secure escrow platform that enables users to conduct 
                safe transactions online. Our services include:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Escrow Services
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Secure fund holding during transactions</li>
                    <li>• Milestone-based payment releases</li>
                    <li>• Dispute resolution and mediation</li>
                    <li>• Transaction monitoring and protection</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Trust & Identity Services
                  </h3>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>• Trust score calculation and display</li>
                    <li>• KYC (Know Your Customer) verification</li>
                    <li>• Identity verification and badges</li>
                    <li>• Public profile and reputation system</li>
                  </ul>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300">
                We act as an intermediary to facilitate secure transactions but are not a party 
                to the underlying agreements between users. We do not guarantee the quality, 
                safety, or legality of items or services offered by users.
              </p>
            </div>
          </section>

          {/* Section 3: User Accounts */}
          <section id="accounts" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
              User Accounts
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-950 p-6 rounded-lg">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">Account Requirements</h3>
              <ul className="text-yellow-800 dark:text-yellow-200 space-y-2">
                <li>• You must provide accurate, current, and complete information during registration</li>
                <li>• You are responsible for maintaining the security of your account credentials</li>
                <li>• You must notify us immediately of any unauthorized use of your account</li>
                <li>• One account per person or business entity is permitted</li>
                <li>• You must verify your email address and may be required to complete KYC verification</li>
              </ul>
            </div>

            <div className="mt-6 bg-red-50 dark:bg-red-950 p-6 rounded-lg">
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-3">Account Restrictions</h3>
              <p className="text-red-800 dark:text-red-200 mb-3">
                You may not create an account if you:
              </p>
              <ul className="text-red-800 dark:text-red-200 space-y-1">
                <li>• Are under 18 years of age</li>
                <li>• Have been previously suspended or banned from the platform</li>
                <li>• Are located in a restricted jurisdiction</li>
                <li>• Are on any government watchlist or sanctions list</li>
                <li>• Intend to use the service for illegal activities</li>
              </ul>
            </div>
          </section>

          {/* Section 4: Escrow Services */}
          <section id="escrow" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
              Escrow Services
            </h2>
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">How Escrow Works</h3>
                <ol className="text-blue-800 dark:text-blue-200 space-y-2">
                  <li>1. Buyer and seller agree on deal terms and milestones</li>
                  <li>2. Buyer funds the escrow account through our secure payment processor</li>
                  <li>3. Funds are held securely until deal conditions are met</li>
                  <li>4. Upon milestone completion and approval, funds are released to the seller</li>
                  <li>5. If disputes arise, our team mediates and makes final decisions</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Transaction Limits</h3>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                    <li>• Minimum transaction: ${DEAL_CONFIG.min_amount}</li>
                    <li>• Maximum transaction: ${DEAL_CONFIG.max_amount.toLocaleString()}</li>
                    <li>• Maximum milestones per deal: {DEAL_CONFIG.max_milestones}</li>
                    <li>• Deal completion timeout: {DEAL_CONFIG.completion_timeout_days} days</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Fund Security</h3>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                    <li>• Funds held in segregated accounts</li>
                    <li>• FDIC-insured banking partners</li>
                    <li>• Enterprise-grade encryption</li>
                    <li>• Regular security audits</li>
                  </ul>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">Important Notices</h3>
                <ul className="text-orange-800 dark:text-orange-200 space-y-2">
                  <li>• We are not responsible for the quality or delivery of goods/services</li>
                  <li>• Funds may be held for up to {DEAL_CONFIG.dispute_timeout_days} days during disputes</li>
                  <li>• We reserve the right to freeze funds for security investigations</li>
                  <li>• Refunds are subject to our dispute resolution process</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5: Savings Features */}
          <section id="savings" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
              Savings Features
            </h2>
            <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg">
              <p className="text-green-800 dark:text-green-200 mb-4">
                Our savings features allow you to set aside funds for future use or transfer money 
                to other verified users. These features are subject to the following terms:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Deposit Limits</h3>
                  <ul className="text-green-800 dark:text-green-200 space-y-1 text-sm">
                    <li>• Minimum deposit: ${SAVINGS_CONFIG.min_deposit}</li>
                    <li>• Maximum deposit: ${SAVINGS_CONFIG.max_deposit.toLocaleString()}</li>
                    <li>• Lock period: {SAVINGS_CONFIG.min_lock_days}-{SAVINGS_CONFIG.max_lock_days} days</li>
                    <li>• Base interest rate: {(SAVINGS_CONFIG.base_interest_rate * 100).toFixed(1)}% annually</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Terms & Conditions</h3>
                  <ul className="text-green-800 dark:text-green-200 space-y-1 text-sm">
                    <li>• Early withdrawal may result in penalty fees</li>
                    <li>• Interest rates may change with notice</li>
                    <li>• Transfers to other users are irreversible</li>
                    <li>• Savings are not FDIC insured investments</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Fees */}
          <section id="fees" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
              Fees and Payments
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Service Fees</h3>
                <div className="text-blue-800 dark:text-blue-200">
                  <p className="mb-2">Our platform charges the following fees:</p>
                  <ul className="space-y-1">
                    <li>• Escrow service fee: {DEAL_CONFIG.escrow_fee_percentage}% per transaction</li>
                    <li>• Payment processing fees: As charged by payment processors</li>
                    <li>• Currency conversion: 1% for international transactions</li>
                    <li>• Express verification: $25 (optional)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 p-6 rounded-lg">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">Payment Terms</h3>
                <ul className="text-yellow-800 dark:text-yellow-200 space-y-2">
                  <li>• All fees are charged at the time of transaction</li>
                  <li>• Fees are non-refundable except in cases of platform error</li>
                  <li>• We reserve the right to change fee structures with 30 days notice</li>
                  <li>• Disputed transaction fees may be waived at our discretion</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 7: User Conduct */}
          <section id="conduct" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">7</span>
              User Conduct
            </h2>
            <div className="space-y-6">
              <div className="bg-red-50 dark:bg-red-950 p-6 rounded-lg">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-3">Prohibited Activities</h3>
                <p className="text-red-800 dark:text-red-200 mb-3">
                  You may not use our platform for any of the following:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="text-red-800 dark:text-red-200 space-y-1 text-sm">
                    <li>• Illegal goods or services</li>
                    <li>• Money laundering or fraud</li>
                    <li>• Adult content or services</li>
                    <li>• Gambling or betting</li>
                    <li>• Weapons or dangerous items</li>
                  </ul>
                  <ul className="text-red-800 dark:text-red-200 space-y-1 text-sm">
                    <li>• Drugs or controlled substances</li>
                    <li>• Copyright or trademark infringement</li>
                    <li>• Spam or unsolicited communications</li>
                    <li>• Hacking or system exploitation</li>
                    <li>• Impersonation or false identity</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">Expected Behavior</h3>
                <ul className="text-green-800 dark:text-green-200 space-y-2">
                  <li>• Communicate honestly and respectfully with other users</li>
                  <li>• Provide accurate descriptions of goods and services</li>
                  <li>• Deliver on agreed terms and timelines</li>
                  <li>• Report suspicious or fraudulent activity</li>
                  <li>• Respect intellectual property rights</li>
                  <li>• Follow all applicable laws and regulations</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 8: Disputes */}
          <section id="disputes" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">8</span>
              Dispute Resolution
            </h2>
            <div className="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">Our Resolution Process</h3>
              <ol className="text-purple-800 dark:text-purple-200 space-y-3">
                <li>
                  <strong>1. Direct Communication:</strong> We encourage users to resolve issues 
                  directly through our messaging system before opening a dispute.
                </li>
                <li>
                  <strong>2. Dispute Filing:</strong> If direct resolution fails, either party 
                  may file a dispute within {DEAL_CONFIG.dispute_timeout_days} days of the issue.
                </li>
                <li>
                  <strong>3. Evidence Review:</strong> Both parties submit evidence and documentation 
                  supporting their position.
                </li>
                <li>
                  <strong>4. Mediation:</strong> Our trained dispute resolution team reviews all 
                  evidence and makes a binding decision.
                </li>
                <li>
                  <strong>5. Resolution:</strong> Funds are released according to the decision, 
                  and trust scores may be adjusted accordingly.
                </li>
              </ol>
            </div>

            <div className="mt-6 bg-orange-50 dark:bg-orange-950 p-6 rounded-lg">
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">Important Notes</h3>
              <ul className="text-orange-800 dark:text-orange-200 space-y-2">
                <li>• Our dispute decisions are final and binding</li>
                <li>• Repeated disputes may result in account restrictions</li>
                <li>• False or frivolous disputes may incur penalties</li>
                <li>• Complex disputes may take up to 14 business days to resolve</li>
              </ul>
            </div>
          </section>

          {/* Section 9: Liability */}
          <section id="liability" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">9</span>
              Limitation of Liability
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong>IMPORTANT:</strong> Please read this section carefully as it limits our 
                liability and affects your legal rights.
              </p>
              
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, {APP_CONFIG.name.toUpperCase()} SHALL NOT BE LIABLE FOR:
                </p>
                
                <ul className="list-disc pl-6 space-y-2">
                  <li>Any indirect, incidental, special, or consequential damages</li>
                  <li>Loss of profits, revenue, data, or business opportunities</li>
                  <li>The quality, safety, or legality of items or services by users</li>
                  <li>Actions or inactions of other users on the platform</li>
                  <li>Technical malfunctions or service interruptions</li>
                  <li>Third-party payment processor failures or delays</li>
                </ul>

                <p>
                  Our total liability to you for any claims arising from or related to these Terms 
                  or the Service shall not exceed the amount of fees you have paid to us in the 
                  twelve (12) months preceding the claim.
                </p>
              </div>
            </div>
          </section>

          {/* Section 10: Termination */}
          <section id="termination" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">10</span>
              Account Termination
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Your Rights</h3>
                <ul className="text-blue-800 dark:text-blue-200 space-y-2">
                  <li>• You may close your account at any time</li>
                  <li>• You must complete all pending transactions</li>
                  <li>• You may withdraw remaining funds after settlement</li>
                  <li>• Account closure does not affect past transactions</li>
                </ul>
              </div>
              
              <div className="bg-red-50 dark:bg-red-950 p-6 rounded-lg">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-3">Our Rights</h3>
                <ul className="text-red-800 dark:text-red-200 space-y-2">
                  <li>• We may suspend accounts for violations</li>
                  <li>• We may terminate accounts with notice</li>
                  <li>• We may freeze funds during investigations</li>
                  <li>• We may retain data as required by law</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 dark:bg-yellow-950 p-6 rounded-lg">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">Effect of Termination</h3>
              <p className="text-yellow-800 dark:text-yellow-200">
                Upon termination, your access to the Service will cease immediately. However, 
                these Terms will continue to apply to transactions completed before termination, 
                and certain provisions will survive termination, including those related to 
                liability, indemnification, and dispute resolution.
              </p>
            </div>
          </section>

          {/* Section 11: Changes to Terms */}
          <section id="changes" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">11</span>
              Changes to Terms
            </h2>
            <div className="bg-indigo-50 dark:bg-indigo-950 p-6 rounded-lg">
              <p className="text-indigo-800 dark:text-indigo-200 mb-4">
                We reserve the right to modify these Terms at any time. When we make changes, we will:
              </p>
              <ul className="text-indigo-800 dark:text-indigo-200 space-y-2">
                <li>• Post the updated Terms on this page</li>
                <li>• Update the &quot;Last Modified&quot; date at the top of this page</li>
                <li>• Notify you by email for material changes</li>
                <li>• Provide at least 30 days notice for material changes</li>
                <li>• Give you the opportunity to review and accept new terms</li>
              </ul>
              <p className="text-indigo-800 dark:text-indigo-200 mt-4">
                Your continued use of the Service after changes take effect constitutes acceptance 
                of the new Terms. If you do not agree to the changes, you must stop using the Service.
              </p>
            </div>
          </section>

          {/* Section 12: Contact */}
          <section id="contact" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">12</span>
              Contact Information
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have questions about these Terms or need to contact us for any reason, 
                you can reach us through the following channels:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">General Inquiries</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Email: {APP_CONFIG.support_email}<br />
                    Response time: Within 24 hours
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Legal Department</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Email: legal@safeswap.com<br />
                    For legal notices and compliance matters
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Final Notice */}
          <div className="bg-blue-600 text-white p-8 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-4">Agreement Acknowledgment</h3>
            <p className="mb-4">
              By using {APP_CONFIG.name}, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms of Service.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register">
                <Button variant="secondary" size="lg">
                  Create Account
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-600">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Related Links */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Related Documents
          </h3>
          <div className="flex items-center justify-center gap-4">
            <Link href="/legal/privacy" className="text-blue-600 hover:text-blue-800 hover:underline">
              Privacy Policy
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/help" className="text-blue-600 hover:text-blue-800 hover:underline">
              Help Center
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/contact" className="text-blue-600 hover:text-blue-800 hover:underline">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}