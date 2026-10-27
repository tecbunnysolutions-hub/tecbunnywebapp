import { Metadata } from 'next';
import { Building, MapPin, Phone, Mail, FileText, Shield, Award } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tecbunny/ui";
import { createPageMetadata } from '@tecbunny/core/metadata';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Business Information - TecBunny Store',
    description: 'Official business registration details, company information, and legal documentation for TECBUNNY SOLUTIONS PRIVATE LIMITED.',
    keywords: ['business', 'registration', 'company', 'legal', 'GST', 'CIN', 'PAN', 'TecBunny'],
    path: '/about/business-info',
  });
}

// export const dynamic = 'force-static';

export default function BusinessInfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-primary/10">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.tecbunny.com' },
          { name: 'About', url: 'https://www.tecbunny.com/about' },
          { name: 'Business Information', url: 'https://www.tecbunny.com/about/business-info' },
        ]}
      />
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Business Information
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Official registration details and business documentation for TECBUNNY SOLUTIONS PRIVATE LIMITED
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Company Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-6 w-6 text-primary" />
              Company Overview
            </CardTitle>
            <CardDescription>
              Legal entity information and business registration details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Legal Name</h3>
                <p className="text-foreground">TECBUNNY SOLUTIONS PRIVATE LIMITED</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Trade Name</h3>
                <p className="text-foreground">TecBunny Store</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Business Type</h3>
                <p className="text-foreground">Private Limited Company</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Incorporation Date</h3>
                <p className="text-foreground">2025</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-success" />
              Official Registration Details
            </CardTitle>
            <CardDescription>
              Government issued registration numbers and certifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <h3 className="text-lg font-semibold text-success mb-2">Corporate Identity Number (CIN)</h3>
                <p className="text-success font-mono text-lg mb-3">U80200GA2025PTC017488</p>
                <a
                  href="/documents/COI.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-success hover:text-success font-medium"
                >
                  <FileText className="h-4 w-4" />
                  Download Certificate of Incorporation
                </a>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h3 className="text-lg font-semibold text-primary mb-2">GST Identification Number (GSTIN)</h3>
                <p className="text-primary font-mono text-lg mb-3">30AAMCT1608G1ZO</p>
                <a
                  href="/documents/GSTIN.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary font-medium"
                >
                  <FileText className="h-4 w-4" />
                  Download GST Certificate
                </a>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h3 className="text-lg font-semibold text-primary mb-2">Permanent Account Number (PAN)</h3>
                <p className="text-primary font-mono text-lg">AAMCT1608G</p>
              </div>
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <h3 className="text-lg font-semibold text-accent mb-2">Tax Deduction Number (TAN)</h3>
                <p className="text-accent font-mono text-lg">BLRT25863F</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registered Address */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-destructive" />
              Registered Address
            </CardTitle>
            <CardDescription>
              Official business address as per government records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-card/5 border border-border/10 rounded-lg">
              <address className="text-lg text-foreground not-italic leading-relaxed">
                TECBUNNY SOLUTIONS PRIVATE LIMITED<br />
                H NO 11 NHAYGINWADA, PARCEM<br />
                Parcem, Pernem<br />
                North Goa - 403512<br />
                Goa, India
              </address>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-6 w-6 text-primary" />
              Official Contact Information
            </CardTitle>
            <CardDescription>
              Verified contact details for business communication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-success" />
              <div>
                <h3 className="font-semibold text-foreground">Customer Support</h3>
                <p className="text-foreground">+91 96041 36010</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Business Email</h3>
                <p className="text-foreground">support@tecbunny.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Website</h3>
                <p className="text-foreground">https://www.tecbunny.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Activities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-warning" />
              Business Activities
            </CardTitle>
            <CardDescription>
              Primary business activities and services offered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Primary Activities</h3>
                <ul className="list-disc list-inside space-y-2 text-foreground">
                  <li>Retail and wholesale of electronic goods and accessories</li>
                  <li>CCTV surveillance systems and security solutions</li>
                  <li>Computer peripherals and networking equipment</li>
                  <li>Mobile accessories and gadgets</li>
                  <li>Installation and technical support services</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Service Areas</h3>
                <p className="text-foreground">
                  We ship products across India. On-site installation and support services cover North Goa and the Sawantwadi area of Sindhudurg district, Maharashtra.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Official Documents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Official Business Documents
            </CardTitle>
            <CardDescription>
              Download authentic business registration documents for verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-6 bg-card/5 rounded-lg border border-border/10 hover:border-border/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Certificate of Incorporation</h3>
                    <p className="text-sm text-muted-foreground">Official company registration document</p>
                  </div>
                </div>
                <a
                  href="/documents/COI.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive transition-colors font-medium"
                >
                  <FileText className="h-4 w-4" />
                  View PDF
                </a>
              </div>

              <div className="flex items-center justify-between p-6 bg-card/5 rounded-lg border border-border/10 hover:border-border/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">GST Registration Certificate</h3>
                    <p className="text-sm text-muted-foreground">Goods and Services Tax registration</p>
                  </div>
                </div>
                <a
                  href="/documents/GSTIN.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-success text-success-foreground px-4 py-2 rounded-lg hover:bg-success transition-colors font-medium"
                >
                  <Shield className="h-4 w-4" />
                  View PDF
                </a>
              </div>
            </div>

            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-primary mb-1">Document Authenticity</h3>
                  <p className="text-sm text-primary">
                    These are official documents issued by the Government of India. All information is verifiable
                    through respective government portals. Documents are provided for transparency and business verification purposes.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance & Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-success" />
              Compliance & Certifications
            </CardTitle>
            <CardDescription>
              Legal compliance and business certifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-success">GST Registered</h3>
                  <p className="text-success text-sm">Valid GST registration for tax compliance</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary">MCA Compliant</h3>
                  <p className="text-primary text-sm">Registered with Ministry of Corporate Affairs</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary">Tax Compliant</h3>
                  <p className="text-primary text-sm">Regular tax filings and compliance</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Building className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-accent">Registered Business Seller</h3>
                  <p className="text-accent text-sm">GST-registered seller of electronic goods</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            This information is accurate as of October 2026. For any business inquiries or verification,
            please contact us at support@tecbunny.com or +91 96041 36010.
          </p>
        </div>
      </div>
    </div>
  );
}
