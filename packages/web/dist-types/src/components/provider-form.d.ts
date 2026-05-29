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
export declare function ProviderForm(props: ProviderFormProps): import("react/jsx-runtime").JSX.Element;
export {};
