import {
  generateSlideImage as generateCodexSlideImage,
  type GenerateImageOptions as CodexImageOptions,
} from "./codex-image";
import {
  generateMiniMaxImage,
  miniMaxImageOptionsFromEnv,
  type MiniMaxImageOptions,
} from "./minimax-image";

export type ImageProvider = "codex" | "minimax";

export interface GenerateImageOptions extends CodexImageOptions {
  provider?: ImageProvider;
  miniMax?: MiniMaxImageOptions;
}

export function resolveImageProvider(
  configured = process.env.CODEX_SLIDES_IMAGE_PROVIDER,
): ImageProvider {
  const provider = configured?.trim().toLowerCase() || "codex";
  if (provider === "codex" || provider === "minimax") return provider;
  throw new Error("Unsupported image provider: " + provider);
}

export function imageProviderSupportsReferences(
  configured = process.env.CODEX_SLIDES_IMAGE_PROVIDER,
): boolean {
  return resolveImageProvider(configured) === "codex";
}

export async function generateSlideImage(
  prompt: string,
  options: GenerateImageOptions = {},
): Promise<Buffer> {
  const provider = options.provider ?? resolveImageProvider();
  if (provider === "codex") return generateCodexSlideImage(prompt, options);

  if (options.refImages?.length) {
    throw new Error("The MiniMax text-to-image backend does not accept reference images");
  }

  const envOptions = miniMaxImageOptionsFromEnv();
  const miniMaxOptions = options.miniMax ?? {};
  return generateMiniMaxImage(prompt, {
    ...envOptions,
    ...miniMaxOptions,
    model: miniMaxOptions.model ?? envOptions.model,
    aspectRatio: miniMaxOptions.aspectRatio ?? String(options.aspect ?? "16:9"),
    signal: options.signal,
  });
}
