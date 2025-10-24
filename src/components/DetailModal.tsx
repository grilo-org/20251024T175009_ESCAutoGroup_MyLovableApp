import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, DollarSign, Package, FileText, MapPin, MessageSquare, Mail, Phone, RotateCcw, Truck } from "lucide-react";
import { useState } from "react";

interface DetailItem {
  id: string;
  title: string;
  amount: number;
  date: string;
  status: "critical" | "warning" | "info";
  description?: string;
  locationId: string;
}

interface Location {
  id: string;
  name: string;
  manager: string;
  phone: string;
  email: string;
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: DetailItem[];
  locations: Location[];
  type: "invoices" | "parts" | "returns" | "cores" | "shipping";
}

export function DetailModal({ isOpen, onClose, title, items, locations, type }: DetailModalProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState<Location | null>(null);
  const getIcon = () => {
    switch (type) {
      case "invoices": return <FileText className="w-5 h-5" />;
      case "parts": return <Package className="w-5 h-5" />;
      case "returns": return <AlertTriangle className="w-5 h-5" />;
      case "cores": return <RotateCcw className="w-5 h-5" />;
      case "shipping": return <Truck className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: DetailItem["status"]) => {
    const styles = {
      critical: "bg-status-critical text-white",
      warning: "bg-status-warning text-white", 
      info: "bg-status-info text-white"
    };
    
    return (
      <Badge className={styles[status]}>
        {status === "critical" ? "Urgent" : status === "warning" ? "Attention" : "Review"}
      </Badge>
    );
  };

  // Group items by location and calculate totals
  const locationSummary = locations.map(location => {
    const locationItems = items.filter(item => item.locationId === location.id);
    const totalAmount = locationItems.reduce((sum, item) => sum + item.amount, 0);
    const criticalCount = locationItems.filter(item => item.status === "critical").length;
    const warningCount = locationItems.filter(item => item.status === "warning").length;
    
    return {
      ...location,
      items: locationItems,
      totalAmount,
      criticalCount,
      warningCount,
      totalCount: locationItems.length
    };
  }).filter(location => location.totalCount > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount); // Sort by highest impact first

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  
  const filteredItems = selectedLocation 
    ? items.filter(item => item.locationId === selectedLocation)
    : [];
    
  const selectedLocationData = locations.find(loc => loc.id === selectedLocation);

  if (selectedLocation && selectedLocationData) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {selectedLocationData.name}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Impact: ${filteredItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</span>
              </div>
            </DialogHeader>
            
            <div className="space-y-3 mt-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-3 border border-border rounded-lg bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm text-card-foreground">{item.title}</h4>
                    {getStatusBadge(item.status)}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-foreground">
                        ${item.amount.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-2">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setSelectedLocation(null)} className="flex-1">
                Back to Locations
              </Button>
              <Button 
                variant="default" 
                className="flex-1"
                onClick={() => setShowMessageModal(selectedLocationData)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Manager
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {showMessageModal && (
          <MessageManagerModal 
            location={showMessageModal}
            onClose={() => setShowMessageModal(null)}
            issueType={type}
            issueCount={filteredItems.length}
            totalAmount={filteredItems.reduce((sum, item) => sum + item.amount, 0)}
          />
        )}
      </>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {title}
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span>Total Impact: ${totalAmount.toLocaleString()}</span>
          </div>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {locationSummary.map((location) => (
            <div 
              key={location.id} 
              className="p-3 border border-border rounded-lg bg-card cursor-pointer hover:bg-accent transition-colors"
              onClick={() => setSelectedLocation(location.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-medium text-sm text-card-foreground">{location.name}</h4>
                </div>
                <div className="flex gap-1">
                  {location.criticalCount > 0 && (
                    <Badge className="bg-status-critical text-white text-xs">
                      {location.criticalCount} Critical
                    </Badge>
                  )}
                  {location.warningCount > 0 && (
                    <Badge className="bg-status-warning text-white text-xs">
                      {location.warningCount} Warning
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-foreground">
                    ${location.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    {location.totalCount} {location.totalCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground mt-2">
                Manager: {location.manager}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MessageManagerModal({ 
  location, 
  onClose, 
  issueType, 
  issueCount, 
  totalAmount 
}: { 
  location: Location; 
  onClose: () => void; 
  issueType: string;
  issueCount: number;
  totalAmount: number;
}) {
  const [message, setMessage] = useState("");
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaSMS, setSendViaSMS] = useState(true);

  const handleSendMessage = () => {
    // This would need backend integration via Supabase
    console.log("Sending message to:", location.manager);
    console.log("Email:", sendViaEmail ? location.email : "Not sending");
    console.log("SMS:", sendViaSMS ? location.phone : "Not sending");
    console.log("Message:", message);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Contact {location.manager}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-sm font-medium">{location.name}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {issueCount} {issueType} issues • ${totalAmount.toLocaleString()} impact
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Send via:</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={sendViaEmail} 
                  onChange={(e) => setSendViaEmail(e.target.checked)}
                />
                <Mail className="w-4 h-4" />
                Email ({location.email})
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={sendViaSMS} 
                  onChange={(e) => setSendViaSMS(e.target.checked)}
                />
                <Phone className="w-4 h-4" />
                SMS ({location.phone})
              </label>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Message:</label>
            <textarea 
              className="w-full p-2 border border-border rounded-md text-sm min-h-[100px]"
              placeholder={`Hi ${location.manager}, we've identified ${issueCount} ${issueType} issues at ${location.name} with a total impact of $${totalAmount.toLocaleString()}. Please review and take action. Thanks!`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            variant="default" 
            onClick={handleSendMessage}
            disabled={!sendViaEmail && !sendViaSMS}
            className="flex-1"
          >
            Send Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}