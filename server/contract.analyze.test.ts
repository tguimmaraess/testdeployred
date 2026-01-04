import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    id: "test-id",
    created: Date.now(),
    model: "test-model",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: `• **Automatic Renewal Clause**: This contract automatically renews unless you cancel 30 days before the end date. This could lock you into unwanted commitments.

• **Limitation of Liability**: The company limits their responsibility for damages to a maximum of the fees you paid. This means if something goes wrong, your compensation is capped.

• **Arbitration Requirement**: Any disputes must go through arbitration instead of court. This may limit your legal options.

• **Data Usage Rights**: The company can use your data for marketing purposes. Make sure you're comfortable with how your information might be shared.`,
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: 100,
      completion_tokens: 200,
      total_tokens: 300,
    },
  }),
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

describe("contract.analyze", () => {
  it("analyzes contract text and returns analysis", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contract.analyze({
      contractText: "This is a sample contract with terms and conditions...",
    });

    expect(result).toHaveProperty("analysis");
    expect(typeof result.analysis).toBe("string");
    expect(result.analysis.length).toBeGreaterThan(0);
    expect(result.analysis).toContain("Automatic Renewal Clause");
  });

  it("rejects empty contract text", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contract.analyze({
        contractText: "",
      })
    ).rejects.toThrow();
  });
});
