export interface AIVisionConfig {
  provider: "mock" | "google-vision" | "aws-rekognition";
  apiKey?: string;
  region?: string;
  minPackageConfidence: number;
  minFaceConfidence: number;
  blurThreshold: number;
  maxIdentifiableFaces: number;
}

export interface AIVisionResult {
  privacy: {
    facesDetected: number;
    facesIdentifiable: boolean;
    rgpdCompliant: boolean;
    confidence: number;
  };
  packageDetection: {
    packagePresent: boolean;
    confidence: number;
  };
  authenticity: {
    blurDetected: boolean;
    blurScore: number;
    manipulationScore: number;
    natural: boolean;
  };
  summary: {
    compliant: boolean;
    requiresReview: boolean;
    warnings: string[];
  };
}

export interface AIVisionProvider {
  analyze(buffer: Buffer, mimeType: string, role: string): Promise<AIVisionResult>;
  name: string;
}

function computeEntropy(buffer: Buffer): number {
  const frequencies = new Array(256).fill(0);
  const len = Math.min(buffer.length, 1024 * 1024);
  for (let i = 0; i < len; i++) {
    const byte = buffer[i];
    if (byte !== undefined) frequencies[byte]++;
  }
  let entropy = 0;
  for (const freq of frequencies) {
    if (freq > 0) {
      const p = freq / len;
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
}

function estimateBlur(buffer: Buffer): number {
  const len = Math.min(buffer.length, 4096);
  let variations = 0;
  for (let i = 1; i < len; i++) {
    const curr = buffer[i];
    const prev = buffer[i - 1];
    if (curr !== undefined && prev !== undefined) {
      variations += Math.abs(curr - prev);
    }
  }
  const avgVariation = variations / len;
  const maxPossible = 255;
  const rawBlurScore = 1 - avgVariation / maxPossible;
  return Math.max(0, Math.min(1, rawBlurScore));
}

function estimateManipulation(buffer: Buffer): number {
  const entropy = computeEntropy(buffer);
  const normalized = Math.min(1, entropy / 8);
  const noiseScore = 1 - normalized;
  return Math.max(0, Math.min(1, noiseScore));
}

const mockProvider: AIVisionProvider = {
  name: "mock",

  async analyze(buffer: Buffer, _mimeType: string, role: string): Promise<AIVisionResult> {
    const blurScore = estimateBlur(buffer);
    const blurDetected = blurScore > 0.6;
    const manipulationScore = estimateManipulation(buffer);
    const entropy = computeEntropy(buffer);

    const facesDetected = entropy > 5.5 ? 1 : 0;
    const facesIdentifiable = facesDetected > 0 && entropy > 6.5 && blurScore < 0.4;
    const rgpdCompliant = !facesIdentifiable || facesDetected === 0 || blurScore > 0.3;

    const packageConfidence = Math.min(0.95, entropy / 8 * 0.9 + 0.1);
    const packagePresent = packageConfidence > 0.4;

    const warnings: string[] = [];
    if (facesIdentifiable) warnings.push(`Visage identifiable detecte (RGPD): photo ${role}`);
    if (blurDetected) warnings.push("Flou détecté dans l'image");
    if (!packagePresent && role === "delivery") warnings.push("Aucun colis détecté dans l'image");

    return {
      privacy: {
        facesDetected,
        facesIdentifiable,
        rgpdCompliant,
        confidence: facesDetected > 0 ? Math.min(0.95, entropy / 8) : 0,
      },
      packageDetection: {
        packagePresent,
        confidence: packageConfidence,
      },
      authenticity: {
        blurDetected,
        blurScore,
        manipulationScore,
        natural: manipulationScore < 0.5,
      },
      summary: {
        compliant: rgpdCompliant,
        requiresReview: !rgpdCompliant || blurDetected || manipulationScore > 0.5,
        warnings,
      },
    };
  },
};

const DEFAULT_CONFIG: AIVisionConfig = {
  provider: "mock",
  minPackageConfidence: 0.4,
  minFaceConfidence: 0.6,
  blurThreshold: 0.6,
  maxIdentifiableFaces: 0,
};

let activeConfig: AIVisionConfig = { ...DEFAULT_CONFIG };
let activeProvider: AIVisionProvider = mockProvider;

export function configureAI(config: Partial<AIVisionConfig>): void {
  activeConfig = { ...activeConfig, ...config };
}

export function setProvider(provider: AIVisionProvider): void {
  activeProvider = provider;
}

export function getConfig(): Readonly<AIVisionConfig> {
  return { ...activeConfig };
}

export function getProviderName(): string {
  return activeProvider.name;
}

export async function analyzePhoto(
  buffer: Buffer,
  mimeType: string,
  role: string
): Promise<AIVisionResult> {
  return activeProvider.analyze(buffer, mimeType, role);
}

export function isCompliant(result: AIVisionResult): boolean {
  return result.privacy.rgpdCompliant;
}

export function requiresReview(result: AIVisionResult): boolean {
  return result.summary.requiresReview;
}
