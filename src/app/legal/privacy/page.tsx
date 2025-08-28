import { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Shield, Eye, Lock, Database, Users, AlertTriangle, CheckCircle } from 'lucide-react'
import { APP_CONFIG, FILE_CONFIG, KYC_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'SafeSwap Privacy Policy - How we collect, use, and protect your personal information on our secure escrow platform',
  robots: 'index, follow'
}

export default function PrivacyPolicyPage() {
  const lastUpdated = '2025-08-27'
  const effectiveDate = '2025-09-01'

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Eye className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how SafeSwap collects, 
            uses, and protects your personal information when you use our secure escrow platform.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
            <span>Last updated: {new Date(lastUpdated).toLocaleDateString()}</span>
            <span>•</span>
            <span>Effective: {new Date(effectiveDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Privacy Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Data Protection
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                Your data is encrypted and protected with enterprise-grade security
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <Eye className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Transparent Use
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                We only collect what&apos;s necessary and explain exactly how it&apos;s used
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Your Control
              </h3>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                You can view, update, or delete your personal information anytime
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Quick Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <Link href="#information-we-collect" className="text-blue-600 hover:text-blue-800 hover:underline">
                1. Information We Collect
              </Link>
              <Link href="#how-we-use" className="text-blue-600 hover:text-blue-800 hover:underline">
                2. How We Use Your Information
              </Link>
              <Link href="#information-sharing" className="text-blue-600 hover:text-blue-800 hover:underline">
                3. Information Sharing
              </Link>
              <Link href="#data-security" className="text-blue-600 hover:text-blue-800 hover:underline">
                4. Data Security
              </Link>
              <Link href="#data-retention" className="text-blue-600 hover:text-blue-800 hover:underline">
                5. Data Retention
              </Link>
              <Link href="#your-rights" className="text-blue-600 hover:text-blue-800 hover:underline">
                6. Your Privacy Rights
              </Link>
              <Link href="#cookies" className="text-blue-600 hover:text-blue-800 hover:underline">
                7. Cookies and Tracking
              </Link>
              <Link href="#international-transfers" className="text-blue-600 hover:text-blue-800 hover:underline">
                8. International Transfers
              </Link>
              <Link href="#children-privacy" className="text-blue-600 hover:text-blue-800 hover:underline">
                9. Children&apos;s Privacy
              </Link>
              <Link href="#policy-changes" className="text-blue-600 hover:text-blue-800 hover:underline">
                10. Policy Changes
              </Link>
              <Link href="#contact-privacy" className="text-blue-600 hover:text-blue-800 hover:underline">
                11. Contact Us
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy Content */}
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">

          {/* Section 1: Information We Collect */}
          <section id="information-we-collect" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
              Information We Collect
            </h2>
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Personal Information
                </h3>
                <p className="text-blue-800 dark:text-blue-200 mb-3">
                  When you create an account or use our services, we collect:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
                    <li>• Full name and display name</li>
                    <li>• Email address and phone number</li>
                    <li>• Profile photo and biography</li>
                    <li>• Address and location information</li>
                  </ul>
                  <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
                    <li>• Government-issued ID for verification</li>
                    <li>• Payment method information</li>
                    <li>• Business information (if applicable)</li>
                    <li>• Communication preferences</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Transaction Information
                </h3>
                <ul className="text-green-800 dark:text-green-200 space-y-2 text-sm">
                  <li>• Deal details, amounts, and milestones</li>
                  <li>• Payment history and transaction records</li>
                  <li>• Messages and communications within the platform</li>
                  <li>• File uploads and document attachments (up to {FILE_CONFIG.max_size / 1024 / 1024}MB per file)</li>
                  <li>• Dispute information and resolution details</li>
                  <li>• Trust score calculations and feedback</li>
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Technical Information
                </h3>
                <p className="text-purple-800 dark:text-purple-200 mb-3">
                  We automatically collect technical data to improve our service:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="text-purple-800 dark:text-purple-200 space-y-1 text-sm">
                    <li>• IP address and location data</li>
                    <li>• Device and browser information</li>
                    <li>• Usage patterns and preferences</li>
                  </ul>
                  <ul className="text-purple-800 dark:text-purple-200 space-y-1 text-sm">
                    <li>• Performance and error logs</li>
                    <li>• Security events and access logs</li>
                    <li>• Cookies and tracking data</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: How We Use Information */}
          <section id="how-we-use" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
              How We Use Your Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Core Services
                  </h3>
                  <ul className="text-green-800 dark:text-green-200 space-y-1 text-sm">
                    <li>• Process and manage transactions</li>
                    <li>• Verify user identity and prevent fraud</li>
                    <li>• Calculate and display trust scores</li>
                    <li>• Facilitate secure messaging</li>
                    <li>• Resolve disputes and provide support</li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security & Compliance
                  </h3>
                  <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
                    <li>• Detect and prevent fraudulent activity</li>
                    <li>• Comply with legal and regulatory requirements</li>
                    <li>• Maintain platform security and integrity</li>
                    <li>• Investigate policy violations</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Communication
                  </h3>
                  <ul className="text-orange-800 dark:text-orange-200 space-y-1 text-sm">
                    <li>• Send transaction notifications</li>
                    <li>• Provide customer support</li>
                    <li>• Share important updates</li>
                    <li>• Send marketing communications (with consent)</li>
                  </ul>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Platform Improvement
                  </h3>
                  <ul className="text-purple-800 dark:text-purple-200 space-y-1 text-sm">
                    <li>• Analyze usage patterns and trends</li>
                    <li>• Develop new features and services</li>
                    <li>• Improve user experience</li>
                    <li>• Generate anonymized insights</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Information Sharing */}
          <section id="information-sharing" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
              Information Sharing
            </h2>
            <div className="space-y-6">
              <div className="bg-red-50 dark:bg-red-950 p-6 rounded-lg">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  We DO NOT Sell Your Data
                </h3>
                <p className="text-red-800 dark:text-red-200 font-medium">
                  {APP_CONFIG.name} does not sell, rent, or trade your personal information 
                  to third parties for marketing purposes.
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 p-6 rounded-lg">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">Limited Sharing Situations</h3>
                <p className="text-yellow-800 dark:text-yellow-200 mb-3">
                  We may share your information only in these specific circumstances:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">With Other Users</h4>
                    <ul className="text-yellow-800 dark:text-yellow-200 space-y-1 text-xs">
                      <li>• Public profile information</li>
                      <li>• Trust scores and ratings</li>
                      <li>• Deal-related communications</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Service Providers</h4>
                    <ul className="text-yellow-800 dark:text-yellow-200 space-y-1 text-xs">
                      <li>• Payment processors (Stripe)</li>
                      <li>• Identity verification services</li>
                      <li>• Cloud hosting providers</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Legal Requirements</h4>
                    <ul className="text-yellow-800 dark:text-yellow-200 space-y-1 text-xs">
                      <li>• Court orders and subpoenas</li>
                      <li>• Law enforcement requests</li>
                      <li>• Regulatory compliance</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Business Transfers</h4>
                    <ul className="text-yellow-800 dark:text-yellow-200 space-y-1 text-xs">
                      <li>• Merger or acquisition</li>
                      <li>• Asset sale</li>
                      <li>• Bankruptcy proceedings</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Data Security */}
          <section id="data-security" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
              Data Security
            </h2>
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Technical Safeguards
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="text-green-800 dark:text-green-200 space-y-2 text-sm">
                    <li>• End-to-end encryption for sensitive data</li>
                    <li>• SSL/TLS encryption for all communications</li>
                    <li>• Multi-factor authentication</li>
                    <li>• Regular security audits and penetration testing</li>
                  </ul>
                  <ul className="text-green-800 dark:text-green-200 space-y-2 text-sm">
                    <li>• Secure cloud infrastructure</li>
                    <li>• Regular automated backups</li>
                    <li>• Access controls and monitoring</li>
                    <li>• Employee security training</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Compliance & Certifications</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="text-blue-800 dark:text-blue-200">PCI DSS Compliant</Badge>
                  <Badge variant="outline" className="text-blue-800 dark:text-blue-200">SOC 2 Type II</Badge>
                  <Badge variant="outline" className="text-blue-800 dark:text-blue-200">GDPR Ready</Badge>
                  <Badge variant="outline" className="text-blue-800 dark:text-blue-200">ISO 27001</Badge>
                </div>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  We maintain industry-standard security certifications and undergo regular 
                  compliance audits to ensure your data is protected according to best practices.
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">Data Breach Response</h3>
                <p className="text-orange-800 dark:text-orange-200 mb-3">
                  In the unlikely event of a data breach, we will:
                </p>
                <ul className="text-orange-800 dark:text-orange-200 space-y-1 text-sm">
                  <li>• Notify affected users within 72 hours</li>
                  <li>• Report to relevant authorities as required</li>
                  <li>• Provide clear information about what happened</li>
                  <li>• Take immediate steps to secure systems</li>
                  <li>• Offer support and protection services</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5: Data Retention */}
          <section id="data-retention" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
              Data Retention
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We retain your personal information only as long as necessary to provide 
                our services and comply with legal obligations.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Active Accounts</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-1">Ongoing</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">While account is active</p>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Closed Accounts</h3>
                  <p className="text-2xl font-bold text-orange-600 mb-1">7 Years</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">For compliance purposes</p>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">KYC Documents</h3>
                  <p className="text-2xl font-bold text-red-600 mb-1">{KYC_CONFIG.review_timeout_days} Days</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">After rejection/approval</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Automatic Deletion</h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  We automatically delete unnecessary data according to our retention schedule. 
                  You can also request early deletion of your data by contacting our support team.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Your Rights */}
          <section id="your-rights" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
              Your Privacy Rights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Access & Transparency
                  </h3>
                  <ul className="text-green-800 dark:text-green-200 space-y-1 text-sm">
                    <li>• View all data we have about you</li>
                    <li>• Download your data in portable format</li>
                    <li>• Know who we share data with and why</li>
                    <li>• Receive clear privacy notices</li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Control & Correction
                  </h3>
                  <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
                    <li>• Update your personal information</li>
                    <li>• Correct inaccurate data</li>
                    <li>• Control marketing communications</li>
                    <li>• Manage privacy settings</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Deletion Rights
                  </h3>
                  <ul className="text-red-800 dark:text-red-200 space-y-1 text-sm">
                    <li>• Request account deletion</li>
                    <li>• Remove specific data points</li>
                    <li>• Cancel pending transactions</li>
                    <li>• Withdraw consent for processing</li>
                  </ul>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Protection Rights
                  </h3>
                  <ul className="text-purple-800 dark:text-purple-200 space-y-1 text-sm">
                    <li>• Object to automated decision-making</li>
                    <li>• Request human review of disputes</li>
                    <li>• Restrict certain processing activities</li>
                    <li>• File complaints with data authorities</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-600 text-white p-6 rounded-lg">
                <h3 className="font-bold mb-3">How to Exercise Your Rights</h3>
                <p className="mb-4 text-blue-100">
                  To exercise any of these rights, contact us at {APP_CONFIG.support_email} 
                  or use the privacy controls in your account settings. We will respond within 30 days.
                </p>
                <Link href="/dashboard/settings">
                  <Button variant="secondary">
                    Privacy Settings
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Section 7: Cookies */}
          <section id="cookies" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">7</span>
              Cookies and Tracking
            </h2>
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-950 p-6 rounded-lg">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">Cookie Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Essential Cookies</h4>
                    <ul className="text-yellow-800 dark:text-yellow-200 space-y-1 text-sm">
                      <li>• Authentication tokens</li>
                      <li>• Security preferences</li>
                      <li>• Session management</li>
                      <li>• Form data persistence</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Optional Cookies</h4>
                    <ul className="text-yellow-800 dark:text-yellow-200 space-y-1 text-sm">
                      <li>• Analytics and usage tracking</li>
                      <li>• Performance monitoring</li>
                      <li>• Personalization settings</li>
                      <li>• Marketing preferences</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Cookie Management</h3>
                <p className="text-blue-800 dark:text-blue-200 mb-3">
                  You can control cookie usage through:
                </p>
                <ul className="text-blue-800 dark:text-blue-200 space-y-2">
                  <li>• Browser settings and preferences</li>
                  <li>• Our cookie consent banner</li>
                  <li>• Account privacy settings</li>
                  <li>• Third-party opt-out tools</li>
                </ul>
                <p className="text-blue-800 dark:text-blue-200 mt-4 text-sm">
                  Note: Disabling essential cookies may impact platform functionality.
                </p>
              </div>
            </div>
          </section>

          {/* Section 8: International Transfers */}
          <section id="international-transfers" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">8</span>
              International Data Transfers
            </h2>
            <div className="bg-indigo-50 dark:bg-indigo-950 p-6 rounded-lg">
              <p className="text-indigo-800 dark:text-indigo-200 mb-4">
                {APP_CONFIG.name} operates globally and may transfer your personal information 
                to countries other than your own. When we do this, we ensure appropriate safeguards are in place:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="text-indigo-800 dark:text-indigo-200 space-y-2 text-sm">
                  <li>• Standard Contractual Clauses (SCCs)</li>
                  <li>• Adequacy decisions by regulatory authorities</li>
                  <li>• Binding Corporate Rules where applicable</li>
                </ul>
                <ul className="text-indigo-800 dark:text-indigo-200 space-y-2 text-sm">
                  <li>• Data Processing Agreements with vendors</li>
                  <li>• Regular compliance monitoring</li>
                  <li>• Local data protection where required</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 9: Children's Privacy */}
          <section id="children-privacy" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">9</span>
              Children&apos;s Privacy
            </h2>
            <div className="bg-red-50 dark:bg-red-950 p-6 rounded-lg">
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Age Requirements
              </h3>
              <p className="text-red-800 dark:text-red-200 mb-4">
                Our service is not intended for children under the age of 18. We do not 
                knowingly collect personal information from children under 18 years of age.
              </p>
              <div className="space-y-2 text-red-800 dark:text-red-200 text-sm">
                <p>If we become aware that a child under 18 has provided personal information, we will:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Immediately delete the information from our systems</li>
                  <li>Terminate the account if one was created</li>
                  <li>Notify the parent or guardian if possible</li>
                  <li>Take steps to prevent future access</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 10: Policy Changes */}
          <section id="policy-changes" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">10</span>
              Changes to This Policy
            </h2>
            <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices, 
                technology, legal requirements, or other factors. When we make changes, we will:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">For Minor Changes</h4>
                  <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
                    <li>• Update the policy on this page</li>
                    <li>• Change the &quot;Last Updated&quot; date</li>
                    <li>• Continue service without interruption</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">For Major Changes</h4>
                  <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
                    <li>• Email notification to all users</li>
                    <li>• Prominent notice on the platform</li>
                    <li>• 30-day notice period before changes take effect</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 11: Contact */}
          <section id="contact-privacy" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">11</span>
              Contact Us About Privacy
            </h2>
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Privacy Questions & Requests</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  If you have questions about this Privacy Policy or want to exercise your privacy rights, 
                  you can contact us through any of these channels:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Email</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      privacy@safeswap.com
                    </p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      48hr response
                    </Badge>
                  </div>
                  
                  <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Support Portal</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Dashboard → Settings
                    </p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      Real-time
                    </Badge>
                  </div>
                  
                  <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Legal</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      legal@safeswap.com
                    </p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      Formal requests
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">Data Protection Officer</h3>
                <p className="text-green-800 dark:text-green-200">
                  Our Data Protection Officer oversees privacy compliance and can be reached at 
                  <strong> dpo@safeswap.com</strong> for complex privacy matters, regulatory questions, 
                  or if you&apos;re not satisfied with our response to your privacy request.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy Commitment Statement */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-4">Our Privacy Commitment</h3>
            <p className="mb-4 text-blue-100">
              At {APP_CONFIG.name}, we believe privacy is a fundamental right. We&apos;re committed 
              to being transparent about our data practices and giving you control over your information.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/dashboard/settings">
                <Button variant="secondary" size="lg">
                  Privacy Settings
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-600">
                  Contact Support
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
            <Link href="/legal/terms" className="text-blue-600 hover:text-blue-800 hover:underline">
              Terms of Service
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/legal/cookies" className="text-blue-600 hover:text-blue-800 hover:underline">
              Cookie Policy
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/security" className="text-blue-600 hover:text-blue-800 hover:underline">
              Security Practices
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}