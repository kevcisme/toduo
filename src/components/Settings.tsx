import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useDatabase } from "../contexts/DatabaseContext";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface SettingsProps {
  className?: string;
}

const Settings: React.FC<SettingsProps> = ({ className = "" }) => {
  const { llmConfig, updateLlmConfig } = useDatabase();

  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("text-embedding-ada-002");
  const [keywordWeight, setKeywordWeight] = useState(0.3);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Load existing config
    if (llmConfig) {
      setOpenaiApiKey(llmConfig.openaiApiKey || "");
      setOpenaiModel(llmConfig.openaiModel || "text-embedding-ada-002");
      setKeywordWeight(
        llmConfig.keywordWeight !== undefined ? llmConfig.keywordWeight : 0.3,
      );
    }
  }, [llmConfig]);

  const handleSaveConfig = async () => {
    setSaveStatus("saving");
    try {
      await updateLlmConfig({
        openaiApiKey,
        openaiModel,
        keywordWeight,
      });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Failed to save LLM configuration:", error);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
      setSaveStatus("error");
    }
  };

  return (
    <div className={`p-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Configure your application settings and integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="llm">
            <TabsList>
              <TabsTrigger value="llm">LLM Configuration</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>
            <TabsContent value="llm" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="openai-api-key">OpenAI API Key</Label>
                <Input
                  id="openai-api-key"
                  type="password"
                  placeholder="sk-..."
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your API key is stored locally and never sent to our servers.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="openai-model">Embedding Model</Label>
                <Input
                  id="openai-model"
                  placeholder="text-embedding-ada-002"
                  value={openaiModel}
                  onChange={(e) => setOpenaiModel(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The OpenAI model to use for generating embeddings.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyword-weight">Keyword Matching Weight</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="keyword-weight"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={keywordWeight}
                    onChange={(e) =>
                      setKeywordWeight(parseFloat(e.target.value))
                    }
                    className="w-full"
                  />
                  <span className="text-sm font-medium w-12">
                    {keywordWeight.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Balance between semantic search (0.0) and keyword matching
                  (1.0).
                </p>
              </div>

              {saveStatus === "success" && (
                <Alert
                  variant="default"
                  className="bg-green-50 border-green-200"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    LLM configuration saved successfully.
                  </AlertDescription>
                </Alert>
              )}

              {saveStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {errorMessage || "Failed to save LLM configuration."}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="database" className="mt-4">
              <p className="text-muted-foreground">
                Database configuration will be available in future updates.
              </p>
            </TabsContent>

            <TabsContent value="general" className="mt-4">
              <p className="text-muted-foreground">
                General settings will be available in future updates.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveConfig} disabled={saveStatus === "saving"}>
            {saveStatus === "saving" ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Settings;
