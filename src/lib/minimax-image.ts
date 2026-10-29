export const MINIMAX_IMAGE_ENDPOINTS = {
  global_en: "https://api.minimax.io/v1/image_generation",
  cn_zh: "https://api.minimaxi.com/v1/image_generation",
} as const;

export const MINIMAX_IMAGE_MODELS = ["image-01", "image-01-live"] as const;

export type MiniMaxImageRegion = keyof typeof MINIMAX_IMAGE_ENDPOINTS;
export type MiniMaxImageModel = (typeof MINIMAX_IMAGE_MODELS)[number];
export type MiniMaxImageResponseFormat = "url" | "base64";

export interface MiniMaxImageOptions {
  apiKey?: string;
  region?: MiniMaxImageRegion;
  model?: MiniMaxImageModel;
  responseFormat?: MiniMaxImageResponseFormat;
  aspectRatio?: string;
  width?: number;
  height?: number;
  /** Local reference images encoded as data URLs for subject_reference. */
  subjectReference?: Buffer[];
  subjectReferenceType?: "character" | "object";
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
}

export class MiniMaxImageError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "MiniMaxImageError";
    this.status = status;
  }
}

export interface MiniMaxImageRequest {
  endpoint: string;
  init: RequestInit;
}

const DEFAULT_REGION: MiniMaxImageRegion = "global_en";
const DEFAULT_MODEL: MiniMaxImageModel = "image-01";
const DEFAULT_RESPONSE_FORMAT: MiniMaxImageResponseFormat = "base64";

function parseDimension(value: string | undefined, name: string): number | undefined {
  if (!value?.trim()) return undefined;
  const dimension = Number(value);
  if (!Number.isInteger(dimension) || dimension <= 0) {
    throw new MiniMaxImageError(name + " must be a positive integer");
  }
  return dimension;
}

function validRegion(value: string): value is MiniMaxImageRegion {
  return value in MINIMAX_IMAGE_ENDPOINTS;
}

function validModel(value: string): value is MiniMaxImageModel {
  return (MINIMAX_IMAGE_MODELS as readonly string[]).includes(value);
}

function validResponseFormat(value: string): value is MiniMaxImageResponseFormat {
  return value === "url" || value === "base64";
}

export function miniMaxImageOptionsFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): MiniMaxImageOptions {
  const region = env.MINIMAX_API_REGION?.trim() || DEFAULT_REGION;
  const model = env.MINIMAX_IMAGE_MODEL?.trim() || DEFAULT_MODEL;
  const responseFormat = env.MINIMAX_IMAGE_RESPONSE_FORMAT?.trim() || DEFAULT_RESPONSE_FORMAT;

  if (!validRegion(region)) {
    throw new MiniMaxImageError("Unsupported MiniMax image region: " + region);
  }
  if (!validModel(model)) {
    throw new MiniMaxImageError("Unsupported MiniMax image model: " + model);
  }
  if (!validResponseFormat(responseFormat)) {
    throw new MiniMaxImageError("Unsupported MiniMax image response format: " + responseFormat);
  }

  return {
    apiKey: env.MINIMAX_API_KEY?.trim() || undefined,
    region,
    model,
    responseFormat,
    width: parseDimension(env.MINIMAX_IMAGE_WIDTH, "MINIMAX_IMAGE_WIDTH"),
    height: parseDimension(env.MINIMAX_IMAGE_HEIGHT, "MINIMAX_IMAGE_HEIGHT"),
  };
}

export function buildMiniMaxImageRequest(
  prompt: string,
  options: MiniMaxImageOptions = {},
): MiniMaxImageRequest {
  const apiKey = options.apiKey?.trim();
  if (!apiKey) throw new MiniMaxImageError("MINIMAX_API_KEY is required for MiniMax image generation");
  if (!prompt.trim()) throw new MiniMaxImageError("MiniMax image prompt must not be empty");

  const region = options.region ?? DEFAULT_REGION;
  const model = options.model ?? DEFAULT_MODEL;
  const responseFormat = options.responseFormat ?? DEFAULT_RESPONSE_FORMAT;
  if (!validRegion(region)) throw new MiniMaxImageError("Unsupported MiniMax image region: " + region);
  if (!validModel(model)) throw new MiniMaxImageError("Unsupported MiniMax image model: " + model);
  if (!validResponseFormat(responseFormat)) {
    throw new MiniMaxImageError("Unsupported MiniMax image response format: " + responseFormat);
  }

  const hasWidth = options.width !== undefined;
  const hasHeight = options.height !== undefined;
  if (hasWidth !== hasHeight) {
    throw new MiniMaxImageError("MiniMax image width and height must be provided together");
  }
  if (hasWidth && (!Number.isInteger(options.width) || (options.width as number) <= 0)) {
    throw new MiniMaxImageError("MiniMax image width must be a positive integer");
  }
  if (hasHeight && (!Number.isInteger(options.height) || (options.height as number) <= 0)) {
    throw new MiniMaxImageError("MiniMax image height must be a positive integer");
  }

  const body: Record<string, unknown> = {
    model,
    prompt,
    response_format: responseFormat,
  };
  if (options.subjectReference?.length) {
    body.subject_reference = options.subjectReference.map((image) => ({
      type: options.subjectReferenceType ?? "character",
      image_file: `data:image/png;base64,${image.toString("base64")}`,
    }));
  }
  if (hasWidth && hasHeight) {
    body.width = options.width;
    body.height = options.height;
  } else {
    body.aspect_ratio = options.aspectRatio || "16:9";
  }

  return {
    endpoint: MINIMAX_IMAGE_ENDPOINTS[region],
    init: {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: options.signal,
    },
  };
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
}

function decodeBase64(value: string): Buffer {
  const comma = value.indexOf(",");
  const encoded = value.startsWith("data:") ? (comma >= 0 ? value.slice(comma + 1) : "") : value;
  const normalized = encoded.replace(/\s/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (!normalized || normalized.length % 4 === 1 || !/^[A-Za-z0-9+/]+={0,2}$/.test(normalized)) {
    throw new MiniMaxImageError("MiniMax returned an invalid base64 image");
  }
  const bytes = Buffer.from(normalized, "base64");
  if (!bytes.length) throw new MiniMaxImageError("MiniMax returned an empty image");
  return bytes;
}

async function resolveImageValue(
  value: string,
  fetchImpl: typeof fetch,
  signal?: AbortSignal,
): Promise<Buffer> {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    const response = await fetchImpl(trimmed, { signal });
    if (!response.ok) {
      throw new MiniMaxImageError("MiniMax image download HTTP " + response.status, response.status);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length) throw new MiniMaxImageError("MiniMax returned an empty image");
    return bytes;
  }
  return decodeBase64(trimmed);
}

export async function parseMiniMaxImageResponse(
  payload: unknown,
  options: { fetchImpl?: typeof fetch; signal?: AbortSignal } = {},
): Promise<Buffer> {
  const root = record(payload);
  const baseResp = record(root?.base_resp);
  const statusCode = baseResp?.status_code;
  if (statusCode !== undefined && statusCode !== null && String(statusCode) !== "0") {
    throw new MiniMaxImageError("MiniMax image generation failed with status code " + statusCode);
  }

  const data = record(root?.data);
  const imageUrls = data?.image_urls;
  if (!Array.isArray(imageUrls)) {
    throw new MiniMaxImageError("MiniMax returned no image URLs");
  }
  const imageValue = imageUrls.find((item): item is string => typeof item === "string" && item.trim().length > 0);
  if (!imageValue) throw new MiniMaxImageError("MiniMax returned no image");
  return resolveImageValue(imageValue, options.fetchImpl ?? fetch, options.signal);
}

export async function generateMiniMaxImage(
  prompt: string,
  options: MiniMaxImageOptions = {},
): Promise<Buffer> {
  const request = buildMiniMaxImageRequest(prompt, options);
  const response = await (options.fetchImpl ?? fetch)(request.endpoint, request.init);
  if (!response.ok) {
    throw new MiniMaxImageError("MiniMax image generation HTTP " + response.status, response.status);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new MiniMaxImageError("MiniMax returned invalid JSON");
  }
  return parseMiniMaxImageResponse(payload, {
    fetchImpl: options.fetchImpl,
    signal: options.signal,
  });
}
