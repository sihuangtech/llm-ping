const SECRET_KEYS = ["apikey", "api-key", "authorization", "access-token", "token", "secret"];

// 对日志、JSON 输出、历史记录统一脱敏，避免 debug 模式误泄露完整密钥。
export function maskSecret(value: string | undefined): string | undefined {
  if (!value) return value;
  if (value.length <= 8) return "*".repeat(value.length);
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export function redactHeaders(headers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => {
      const normalized = key.toLowerCase();
      const isSecret = SECRET_KEYS.some((secretKey) => normalized.includes(secretKey));
      return [key, isSecret ? (maskSecret(value) ?? "") : value];
    }),
  );
}

export function redactObject<T>(input: T): T {
  if (Array.isArray(input)) return input.map((item) => redactObject(item)) as T;
  if (!input || typeof input !== "object") return input;

  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const normalized = key.toLowerCase();
    if (typeof value === "string" && SECRET_KEYS.some((secretKey) => normalized.includes(secretKey))) {
      output[key] = maskSecret(value);
    } else {
      output[key] = redactObject(value);
    }
  }
  return output as T;
}
