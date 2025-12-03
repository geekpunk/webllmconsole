import { CreateMLCEngine, hasModelInCache, prebuiltAppConfig } from "@mlc-ai/web-llm";

export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const DEFAULT_MODELS = [
    {
        id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
        name: "Llama 3.2 1B (Fastest)",
        vram_required_MB: 1000,
        mobile: true,
        context_window: 128000
    },
    {
        id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
        name: "Llama 3.2 3B (Balanced)",
        vram_required_MB: 2500,
        mobile: false,
        context_window: 128000
    },
    {
        id: "gemma-2-2b-it-q4f32_1-MLC-1k",
        name: "Gemma 2 2B",
        vram_required_MB: 1500,
        mobile: true,
        context_window: 8192
    }
];

const formatModelName = (modelId) => {
    return modelId
        .replace(/-MLC.*/, "")
        .replace(/-/g, " ");
};

const OTHER_MODELS = prebuiltAppConfig.model_list
    .filter(m => !DEFAULT_MODELS.some(dm => dm.id === m.model_id))
    .map(m => ({
        id: m.model_id,
        name: formatModelName(m.model_id),
        vram_required_MB: m.vram_required_MB || 4000,
        mobile: m.low_resource_required || false,
        context_window: m.overrides?.context_window_size || 4096
    }));

// Available models can be configured here or fetched dynamically if needed
const ALL_MODELS = [...DEFAULT_MODELS, ...OTHER_MODELS];

export const getAvailableModels = () => {
    if (isMobile()) {
        return ALL_MODELS.filter(m => m.mobile);
    }
    return ALL_MODELS;
};

export const AVAILABLE_MODELS = ALL_MODELS; // Keep for backward compatibility if needed, but prefer getAvailableModels()

class LLMService {
    constructor() {
        this.engine = null;
        this.currentModelId = null;
        this.initPromise = null;
    }

    async initialize(modelId, progressCallback) {
        if (this.currentModelId === modelId && this.engine) {
            return;
        }

        this.currentModelId = modelId;

        try {
            this.engine = await CreateMLCEngine(
                modelId,
                { initProgressCallback: progressCallback }
            );
        } catch (error) {
            console.error("Failed to initialize engine", error);
            throw error;
        }
    }

    // Just download the model without keeping it loaded as the active engine if possible
    async downloadModel(modelId, progressCallback) {
        try {
            const isCached = await hasModelInCache(modelId);
            if (isCached) {
                if (progressCallback) {
                    progressCallback({ text: "Ready", progress: 1 });
                }
                return;
            }

            // We use a temporary engine to download to cache
            const engine = await CreateMLCEngine(
                modelId,
                { initProgressCallback: progressCallback }
            );
            // We don't set this.engine because we don't want to switch the active model context yet
            // unless we want to.
            // But CreateMLCEngine might use resources.
            // Ideally we should unload it after download.
            await engine.unload();
        } catch (error) {
            console.error(`Failed to download model ${modelId}`, error);
        }
    }

    async chat(messages, onUpdate, onFinish) {
        if (!this.engine) {
            throw new Error("Engine not initialized");
        }

        try {
            const chunks = await this.engine.chat.completions.create({
                messages,
                stream: true,
            });

            let fullResponse = "";
            for await (const chunk of chunks) {
                const content = chunk.choices[0]?.delta?.content || "";
                fullResponse += content;
                onUpdate(fullResponse);
            }

            if (onFinish) {
                onFinish(fullResponse);
            }
            return fullResponse;
        } catch (error) {
            console.error("Chat generation failed", error);
            throw error;
        }
    }

    async interrupt() {
        if (this.engine) {
            await this.engine.interruptGenerate();
        }
    }

    async generateTitle(messages) {
        if (!this.engine || messages.length < 2) return null;

        // Create a separate non-streaming request for title generation
        // We use a simplified prompt
        const titleMessages = [
            ...messages.slice(0, 3), // Context
            { role: "user", content: "Generate a short, concise title (3-5 words max) for this conversation. Do not use quotes. Return ONLY the title." }
        ];

        try {
            const response = await this.engine.chat.completions.create({
                messages: titleMessages,
                stream: false,
                max_tokens: 20
            });
            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error("Title generation failed", error);
            return null;
        }
    }

    async summarize(text) {
        if (!this.engine || !text) return text;

        const messages = [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `Summarize the following text into exactly 2 sentences:\n\n${text}` }
        ];

        try {
            const response = await this.engine.chat.completions.create({
                messages,
                stream: false,
                max_tokens: 150
            });
            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error("Summary generation failed", error);
            return text; // Fallback to original text
        }
    }
}

export const llmService = new LLMService();
