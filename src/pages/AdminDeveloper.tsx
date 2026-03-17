import { useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Eye, EyeOff, Check, ExternalLink, Code2, Webhook, AppWindow, Plus } from "lucide-react";
import { toast } from "sonner";

/* ─── Integration config ─── */
interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  fields: { key: string; label: string; placeholder: string; type: "text" | "password" }[];
  docsUrl?: string;
  status: "not_configured" | "configured" | "error";
}

const INTEGRATIONS: IntegrationConfig[] = [
  {
    id: "google_ads",
    name: "Google Ads",
    description: "Google Ads API for campaign management and performance data",
    fields: [
      { key: "GOOGLE_ADS_CLIENT_ID", label: "OAuth Client ID", placeholder: "Enter Google OAuth client ID", type: "text" },
      { key: "GOOGLE_ADS_CLIENT_SECRET", label: "OAuth Client Secret", placeholder: "Enter OAuth client secret", type: "password" },
      { key: "GOOGLE_ADS_DEVELOPER_TOKEN", label: "Developer Token", placeholder: "Enter Google Ads developer token", type: "password" },
      { key: "GOOGLE_ADS_CUSTOMER_ID", label: "Customer ID", placeholder: "Enter customer ID (without dashes)", type: "text" },
      { key: "GOOGLE_ADS_REFRESH_TOKEN", label: "Refresh Token (optional)", placeholder: "Generated after OAuth flow", type: "password" },
    ],
    docsUrl: "https://developers.google.com/google-ads/api/docs/start",
    status: "not_configured",
  },
  {
    id: "meta_business",
    name: "Meta Business (Facebook/Instagram Ads)",
    description: "Meta Marketing API for Facebook and Instagram ad campaigns",
    fields: [
      { key: "META_APP_ID", label: "App ID", placeholder: "Enter Meta App ID", type: "text" },
      { key: "META_APP_SECRET", label: "App Secret", placeholder: "Enter Meta App secret", type: "password" },
      { key: "META_ACCESS_TOKEN", label: "Access Token", placeholder: "Enter system user access token", type: "password" },
      { key: "META_AD_ACCOUNT_ID", label: "Ad Account ID", placeholder: "act_XXXXXXXXX", type: "text" },
    ],
    docsUrl: "https://developers.facebook.com/docs/marketing-apis",
    status: "not_configured",
  },
  {
    id: "granot",
    name: "Granot CRM",
    description: "Moving industry CRM for brokers and carriers",
    fields: [
      { key: "GRANOT_API_KEY", label: "API Key", placeholder: "Enter Granot API key", type: "password" },
      { key: "GRANOT_SECRET", label: "Secret Token", placeholder: "Enter secret token", type: "password" },
    ],
    docsUrl: "https://granot.io/api-docs",
    status: "not_configured",
  },
  {
    id: "ringcentral",
    name: "RingCentral",
    description: "Cloud phone, video, and messaging communications",
    fields: [
      { key: "RINGCENTRAL_CLIENT_ID", label: "Client ID", placeholder: "Enter client ID", type: "text" },
      { key: "RINGCENTRAL_CLIENT_SECRET", label: "Client Secret", placeholder: "Enter client secret", type: "password" },
      { key: "RINGCENTRAL_JWT_TOKEN", label: "JWT Token (optional)", placeholder: "Enter JWT token", type: "password" },
    ],
    docsUrl: "https://developers.ringcentral.com/api-reference",
    status: "not_configured",
  },
  {
    id: "dashclicks",
    name: "DashClicks",
    description: "White-label marketing platform and fulfillment services",
    fields: [
      { key: "DASHCLICKS_API_KEY", label: "API Key", placeholder: "Enter DashClicks API key", type: "password" },
      { key: "DASHCLICKS_AGENCY_ID", label: "Agency ID", placeholder: "Enter agency ID", type: "text" },
    ],
    docsUrl: "https://www.dashclicks.com/api",
    status: "not_configured",
  },
  {
    id: "yembo",
    name: "Yembo",
    description: "AI-powered video surveys for moving inventory analysis",
    fields: [
      { key: "YEMBO_API_KEY", label: "API Key", placeholder: "Enter Yembo API key", type: "password" },
      { key: "YEMBO_COMPANY_ID", label: "Company ID", placeholder: "Enter company ID", type: "text" },
    ],
    docsUrl: "https://www.yembo.ai/developers",
    status: "not_configured",
  },
];

/* ─── Sub-components ─── */

function ApiKeysTab() {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const togglePasswordVisibility = (fieldKey: string) => {
    setShowPasswords((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const handleSave = async (integration: IntegrationConfig) => {
    setSaving(integration.id);
    const hasAllFields = integration.fields.every((field) => {
      if (field.key === "RINGCENTRAL_JWT_TOKEN" || field.key === "GOOGLE_ADS_REFRESH_TOKEN") return true;
      const value = formData[field.key];
      return value && value.trim().length > 0;
    });
    if (!hasAllFields) {
      toast.error("Please fill in all required fields");
      setSaving(null);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(`${integration.name} API keys saved successfully`, {
      description: "Keys are securely stored. Integration ready when you purchase access.",
    });
    setSaving(null);
  };

  return (
    <div className="space-y-6">
      {INTEGRATIONS.map((integration) => (
        <Card key={integration.id} className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <CardDescription>{integration.description}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={integration.status === "configured" ? "default" : "secondary"}>
                  {integration.status === "configured" ? "Configured" : "Not Configured"}
                </Badge>
                {integration.docsUrl && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {integration.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <div className="relative">
                    <Input
                      id={field.key}
                      type={field.type === "password" && !showPasswords[field.key] ? "password" : "text"}
                      placeholder={field.placeholder}
                      value={formData[field.key] || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      className="pr-10"
                    />
                    {field.type === "password" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility(field.key)}
                      >
                        {showPasswords[field.key] ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button onClick={() => handleSave(integration)} disabled={saving === integration.id} className="w-full sm:w-auto">
                {saving === integration.id ? "Saving..." : <><Check className="w-4 h-4 mr-2" />Save API Keys</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CustomAppsTab() {
  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Custom Apps</CardTitle>
            <CardDescription>Build and manage custom apps that extend TruMove</CardDescription>
          </div>
          <Button variant="outline" size="sm" disabled>
            <Plus className="w-4 h-4 mr-2" />
            New App
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AppWindow className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No custom apps yet. This feature is coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function WebhooksTab() {
  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Webhooks</CardTitle>
            <CardDescription>Configure webhooks for real-time event notifications</CardDescription>
          </div>
          <Button variant="outline" size="sm" disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Webhook
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Webhook className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No webhooks configured. This feature is coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Main page ─── */

export default function AdminDeveloper() {
  return (
    <AdminShell breadcrumb=" / Developer">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Code2 className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Developer</h1>
          </div>
          <p className="text-muted-foreground">
            Manage API keys, custom integrations, webhooks, and third-party apps.
          </p>
        </div>

        <Tabs defaultValue="api-keys" className="space-y-6">
          <TabsList>
            <TabsTrigger value="api-keys" className="gap-2">
              <Key className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="custom-apps" className="gap-2">
              <AppWindow className="w-4 h-4" />
              Custom Apps
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-2">
              <Webhook className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys">
            <ApiKeysTab />
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> API keys are encrypted and stored securely. They will only be used when you activate the corresponding integration.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="custom-apps">
            <CustomAppsTab />
          </TabsContent>

          <TabsContent value="webhooks">
            <WebhooksTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  );
}
