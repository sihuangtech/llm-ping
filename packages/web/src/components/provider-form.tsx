import type { ProviderCapability } from "@llm-ping/shared";

import type { ProviderFormState } from "../pages/providerConfig";

type ProviderFormProps = {
  capabilities?: ProviderCapability[];
  form: ProviderFormState;
  formError: string;
  onChange: (form: ProviderFormState) => void;
  onClear: () => void;
  onSubmit: () => void;
  onTypeChange: (type: string) => void;
};

export function ProviderForm(props: ProviderFormProps) {
  const { capabilities, form, formError, onChange, onClear, onSubmit, onTypeChange } = props;

  return (
    <>
      <div className="grid grid-cols-4 gap-3">
        <Field label="Provider ID"><TextInput value={form.id} onChange={(id) => onChange({ ...form, id })} placeholder="openai-main" /></Field>
        <Field label="名称"><TextInput value={form.name} onChange={(name) => onChange({ ...form, name })} placeholder="OpenAI Main" /></Field>
        <Field label="Provider 类型">
          <select className="h-9 w-full rounded-md border border-line px-3 text-sm" value={form.type} onChange={(event) => onTypeChange(event.target.value)}>
            {capabilities?.map((capability) => <option key={capability.id} value={capability.id}>{capability.name}</option>)}
          </select>
        </Field>
        <Field label="模型"><TextInput value={form.model} onChange={(model) => onChange({ ...form, model })} placeholder="gpt-4o-mini" /></Field>
        <Field label="Base URL"><TextInput value={form.baseUrl} onChange={(baseUrl) => onChange({ ...form, baseUrl })} placeholder="https://api.openai.com" /></Field>
        <Field label="API Key"><TextInput type="password" value={form.apiKey} onChange={(apiKey) => onChange({ ...form, apiKey })} placeholder="${OPENAI_API_KEY}" /></Field>
        <Field label="Access Token"><TextInput type="password" value={form.accessToken} onChange={(accessToken) => onChange({ ...form, accessToken })} /></Field>
        <Field label="Deployment"><TextInput value={form.deployment} onChange={(deployment) => onChange({ ...form, deployment })} /></Field>
        <Field label="API Version"><TextInput value={form.apiVersion} onChange={(apiVersion) => onChange({ ...form, apiVersion })} placeholder="2024-02-15-preview" /></Field>
        <Field label="Project ID"><TextInput value={form.projectId} onChange={(projectId) => onChange({ ...form, projectId })} /></Field>
        <Field label="Location"><TextInput value={form.location} onChange={(location) => onChange({ ...form, location })} placeholder="us-central1" /></Field>
        <Field label="Timeout"><TextInput type="number" value={String(form.timeoutMs)} onChange={(timeoutMs) => onChange({ ...form, timeoutMs: Number(timeoutMs) })} /></Field>
        <Field label="Retries"><TextInput type="number" value={String(form.retries)} onChange={(retries) => onChange({ ...form, retries: Number(retries) })} /></Field>
        <Toggle label="启用" checked={form.enabled} onChange={(enabled) => onChange({ ...form, enabled })} />
        <Toggle label="严格模型检测" checked={form.strictModelCheck} onChange={(strictModelCheck) => onChange({ ...form, strictModelCheck })} />
        <Toggle label="跳过模型列表" checked={form.skipModelList} onChange={(skipModelList) => onChange({ ...form, skipModelList })} />
        <Toggle label="Streaming" checked={form.streaming} onChange={(streaming) => onChange({ ...form, streaming })} />
        <Field label="自定义 Prompt">
          <textarea className="min-h-20 w-full rounded-md border border-line px-3 py-2 text-sm" value={form.customPrompt} onChange={(event) => onChange({ ...form, customPrompt: event.target.value })} />
        </Field>
        <Field label="Headers">
          <textarea className="min-h-20 w-full rounded-md border border-line px-3 py-2 font-mono text-sm" value={form.headersText} onChange={(event) => onChange({ ...form, headersText: event.target.value })} placeholder="x-custom-header: value" />
        </Field>
      </div>
      {formError && <p className="mt-3 text-sm text-red-700">{formError}</p>}
      <div className="mt-3 flex gap-2">
        <button className="inline-flex h-9 items-center rounded-md border border-brand bg-brand px-3 text-sm font-medium text-white hover:bg-teal-800" onClick={onSubmit}>保存配置</button>
        <button className="inline-flex h-9 items-center rounded-md border border-line bg-white px-3 text-sm font-medium hover:bg-slate-50" onClick={onClear}>清空</button>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="space-y-1 text-sm"><span className="block text-xs font-medium text-slate-500">{label}</span>{children}</label>;
}

function TextInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <input type={type} className="h-9 w-full rounded-md border border-line px-3 text-sm" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />{label}</label>;
}
