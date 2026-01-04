import { useState, useEffect, useRef } from "react";
import { useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, FileText, Lock, CheckCircle, Loader2, Shield, Upload, X } from "lucide-react";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

export default function Home() {
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const isSuccess = searchParams.get("success") === "true";

  const [contractText, setContractText] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(isSuccess);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mutation for contract analysis
  const analyzeMutation = trpc.contract.analyze.useMutation({
    onSuccess: (data: { analysis: string }) => {
      setAnalysis(data.analysis);
    },
  });

  // Mutation for PDF extraction
  const extractPdfMutation = trpc.contract.extractPdf.useMutation({
    onSuccess: (data: { text: string }) => {
      setContractText(data.text);
      toast.success("PDF text extracted successfully!");
      setIsExtractingPdf(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to extract text from PDF");
      setIsExtractingPdf(false);
      setUploadedFile(null);
    },
  });

  // Mutation for creating checkout session
  const checkoutMutation = trpc.payment.createCheckout.useMutation({
    onSuccess: (data: { url: string | null }) => {
      if (data.url) {
        // Store analysis in sessionStorage before redirecting
        if (analysis) {
          sessionStorage.setItem("pendingAnalysis", analysis);
          sessionStorage.setItem("pendingContract", contractText);
        }
        window.location.href = data.url;
      }
    },
  });

  // Restore analysis after successful payment
  useEffect(() => {
    if (isSuccess) {
      const pendingAnalysis = sessionStorage.getItem("pendingAnalysis");
      const pendingContract = sessionStorage.getItem("pendingContract");
      if (pendingAnalysis) {
        setAnalysis(pendingAnalysis);
        setIsUnlocked(true);
        sessionStorage.removeItem("pendingAnalysis");
      }
      if (pendingContract) {
        setContractText(pendingContract);
        sessionStorage.removeItem("pendingContract");
      }
    }
  }, [isSuccess]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploadedFile(file);
    setIsExtractingPdf(true);

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      extractPdfMutation.mutate({ pdfBase64: base64 });
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
      setIsExtractingPdf(false);
      setUploadedFile(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setContractText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = () => {
    if (!contractText.trim()) return;
    analyzeMutation.mutate({ contractText });
  };

  const handleUnlock = () => {
    checkoutMutation.mutate();
  };

  // Parse analysis into bullet points
  const parseBulletPoints = (text: string): string[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    const bullets: string[] = [];
    let currentBullet = "";

    for (const line of lines) {
      if (line.match(/^[\-\*•]\s/) || line.match(/^\d+\.\s/)) {
        if (currentBullet) bullets.push(currentBullet.trim());
        currentBullet = line;
      } else if (currentBullet) {
        currentBullet += " " + line;
      } else {
        bullets.push(line);
      }
    }
    if (currentBullet) bullets.push(currentBullet.trim());
    return bullets;
  };

  const bulletPoints = analysis ? parseBulletPoints(analysis) : [];
  const previewBullets = bulletPoints.slice(0, 2);
  const hiddenBullets = bulletPoints.slice(2);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">Contract</span>
            <span className="text-xl font-semibold text-primary">RedFlag</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="container max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Spot risky contract clauses{" "}
            <span className="text-primary">before you sign.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Paste any contract or upload a PDF and instantly see potential red flags explained in plain English.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 container max-w-4xl py-12">
        {/* Contract Input */}
        <Card className="mb-8 border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Your contract</h2>
              </div>
            </div>

            {/* PDF Upload Section */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-upload"
              />
              
              {!uploadedFile ? (
                <label
                  htmlFor="pdf-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-1 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload PDF</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PDF files up to 10MB</p>
                  </div>
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    disabled={isExtractingPdf}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {isExtractingPdf && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Extracting text from PDF...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-x-0 top-0 flex items-center justify-center -mt-3">
                <span className="bg-background px-3 text-sm text-muted-foreground">or paste text directly</span>
              </div>
              <div className="border-t border-border pt-6">
                <Textarea
                  placeholder="Paste your contract text here..."
                  className="min-h-[200px] resize-y text-base leading-relaxed"
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                size="lg"
                onClick={handleAnalyze}
                disabled={!contractText.trim() || analyzeMutation.isPending || isExtractingPdf}
                className="min-w-[180px]"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze contract"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Analysis Results</h2>
              </div>

              {/* Preview Section - First 2 bullets */}
              <div className="space-y-4 mb-6">
                {previewBullets.map((bullet, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border"
                  >
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-foreground leading-relaxed">
                      <Streamdown>{bullet}</Streamdown>
                    </div>
                  </div>
                ))}
              </div>

              {/* Blurred Section - Remaining bullets */}
              {hiddenBullets.length > 0 && !isUnlocked && (
                <div className="relative">
                  <div className="blur-content space-y-4">
                    {hiddenBullets.slice(0, 3).map((bullet, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border"
                      >
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-foreground leading-relaxed">
                          <Streamdown>{bullet}</Streamdown>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Unlock Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
                    <div className="text-center p-6 max-w-md">
                      <Lock className="h-10 w-10 text-primary mx-auto mb-4" />
                      <p className="text-foreground font-medium mb-2">
                        Unlock the full analysis for $9
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        No legal advice. Just clarity.
                      </p>
                      <Button
                        onClick={handleUnlock}
                        disabled={checkoutMutation.isPending}
                        className="min-w-[180px]"
                      >
                        {checkoutMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Unlock full analysis"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Analysis - When unlocked */}
              {isUnlocked && hiddenBullets.length > 0 && (
                <div className="space-y-4">
                  {hiddenBullets.map((bullet, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border"
                    >
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="text-foreground leading-relaxed">
                        <Streamdown>{bullet}</Streamdown>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Success Message */}
              {isUnlocked && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Full analysis unlocked!</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {(analyzeMutation.isError || extractPdfMutation.isError) && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <span>
                  {extractPdfMutation.isError
                    ? "Failed to extract text from PDF. Please try again or paste the text directly."
                    : "An error occurred while analyzing the contract. Please try again."}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
