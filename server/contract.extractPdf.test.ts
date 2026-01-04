import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the pdf-parse module
vi.mock("pdf-parse", () => ({
  PDFParse: vi.fn().mockImplementation(() => ({
    getText: vi.fn().mockResolvedValue({
      text: "This is a sample contract text extracted from PDF.\n\nTerms and conditions apply.",
    }),
  })),
}));

function createMockContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("contract.extractPdf", () => {
  it("extracts text from PDF base64 data", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Sample base64 encoded PDF (minimal valid PDF)
    const samplePdfBase64 = "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSA+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDQgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjE5OAolJUVPRg==";

    const result = await caller.contract.extractPdf({
      pdfBase64: samplePdfBase64,
    });

    expect(result).toHaveProperty("text");
    expect(typeof result.text).toBe("string");
    expect(result.text.length).toBeGreaterThan(0);
  });

  it("rejects empty PDF data", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contract.extractPdf({
        pdfBase64: "",
      })
    ).rejects.toThrow();
  });
});
