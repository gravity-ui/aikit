export enum ModelTier {
    Default = 'default',
    Economy = 'economy',
    Comfort = 'comfort',
    Max = 'max',
}

export type ModelItem = {
    /**
     * Id
     * Model id to send in the `model` field
     */
    id: string;
    /**
     * Object
     * @default "model"
     */
    object?: 'model';
    /**
     * Created
     * Unix timestamp of the model release
     */
    created: number;
    /**
     * Owned By
     * Provider serving the model; see `developer` for its author
     */
    owned_by?: string;
    /** Name */
    name: string;
    /**
     * Developer
     * Who built the model, not the provider we run it through; absent when undisclosed
     */
    developer?: string | null;
    /**
     * License
     * Name of the licence the weights are published under; absent when there is no open licence
     */
    license?: string | null;
    /**
     * Description
     * One-sentence summary shown on the model card, in English
     */
    description: string;
    /**
     * Description Ru
     * Russian `description`; absent when the card carries no translation
     */
    description_ru?: string | null;
    /**
     * Description Full
     * Multi-paragraph text for the model's detail pane, paragraphs separated by a blank line
     */
    description_full?: string | null;
    /**
     * Description Full Ru
     * Russian `description_full`; absent when the card carries no translation
     */
    description_full_ru?: string | null;
    /**
     * Context Length
     * Maximum number of input tokens the service accepts
     */
    context_length: number;
    /** Max Output Tokens */
    max_output_tokens: number;
    architecture: ArchitectureInfo;
    /** How fast the model spends the quota */
    tier?: ModelTier | null;
    /**
     * Supported Parameters
     * Unknown values should be ignored
     */
    supported_parameters: string[];
    /**
     * Supported Endpoints
     * Endpoints to call the model at
     */
    supported_endpoints?: string[] | null;
    /** Absent when the model cannot think */
    reasoning?: ReasoningInfo | null;
    /**
     * External
     * Whether the request data may be sent to an external provider
     */
    external: boolean;
    /**
     * Disabled By
     * Why the model cannot be used; sent only when disabled models are asked for
     */
    disabled_by?: 'admin' | 'tariff' | 'provider' | 'request' | null;
};

export type ArchitectureInfo = {
    /** Input Modalities */
    input_modalities: string[];
    /** Output Modalities */
    output_modalities: string[];
    /**
     * Parameter Count
     * Total parameters, not the active ones of a sparse model; absent when the developer discloses none
     */
    parameter_count?: number | null;
};

export type ReasoningInfo = {
    /**
     * Mandatory
     * Whether the model always thinks, whatever effort the request names
     * @default false
     */
    mandatory?: boolean;
    /**
     * Default Enabled
     * Whether the model thinks when the request names no effort
     */
    default_enabled: boolean;
    /**
     * Default Effort
     * Effort it thinks at, whether or not thinking is on by default
     */
    default_effort: string;
    /**
     * Supported Efforts
     * Accepted effort values; `none` switches thinking off
     */
    supported_efforts: string[];
};
