import type { CheckResult, ProviderCapability, ProviderConfig } from "@llm-ping/shared";

export interface ProviderAdapter {
  readonly capability: ProviderCapability;
  check(config: ProviderConfig): Promise<CheckResult>;
}
