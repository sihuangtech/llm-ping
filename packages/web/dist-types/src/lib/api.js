const API_BASE = import.meta.env.VITE_LLM_PING_API ?? "http://127.0.0.1:4545";
async function request(path, options) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: { "content-type": "application/json", ...options?.headers },
        ...options,
    });
    if (!response.ok)
        throw new Error(await response.text());
    return response.json();
}
export const api = {
    capabilities: () => request("/providers/capabilities"),
    providers: () => request("/providers"),
    saveProvider: (provider) => request("/providers", { method: "POST", body: JSON.stringify(provider) }),
    deleteProvider: (id) => request(`/providers/${id}`, { method: "DELETE" }),
    checkProvider: (id) => request(`/checks/${id}`, { method: "POST" }),
    checkAll: () => request("/checks", { method: "POST" }),
    history: () => request("/history"),
    exportUrl: (format) => `${API_BASE}/export?format=${encodeURIComponent(format)}`,
};
//# sourceMappingURL=api.js.map