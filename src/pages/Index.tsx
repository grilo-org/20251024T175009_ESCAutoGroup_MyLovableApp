import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BarChart3, Shield, DollarSign, FileText, Smartphone } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            WickedFile
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Complete parts tracking and invoice reconciliation for auto repair shops
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/dashboard')}
            className="text-lg px-8 py-6"
          >
            <Smartphone className="w-5 h-5 mr-2" />
            Open Mobile Dashboard
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Track Every Dollar, Every Part
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ensure your team scans invoices, matches parts correctly, and processes returns - 
            all while keeping you informed of financial risks.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <FileText className="w-8 h-8 text-brand-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Invoice Scanning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track which invoices need scanning and alert on overdue items
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-brand-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Parts Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Verify parts purchased match what's charged to customers
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="w-8 h-8 text-brand-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Return Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor return authorizations and ensure credits are processed
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <DollarSign className="w-8 h-8 text-brand-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Financial Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time visibility into dollars at risk from process gaps
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to monitor your shop's performance?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Access your executive dashboard designed for mobile to stay informed wherever you are.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/dashboard')}
          >
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
