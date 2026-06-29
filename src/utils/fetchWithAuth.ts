import axios from "axios";
import crypto from "crypto";
import type { HttpMethod, ApiResponse } from "../types/common.js";

const NAVER_API_BASE_URL = "https://api.naver.com";

/**
 * Generate HMAC-SHA256 signature for Naver API authentication.
 * The signature is computed over: `{timestamp}.{method}.{path}`
 * where `path` is the URI path WITHOUT query string.
 */
function generateSignature(
  timestamp: string,
  method: string,
  path: string,
  secretKey: string
): string {
  const message = `${timestamp}.${method}.${path}`;
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(message);
  return hmac.digest("base64");
}

/**
 * Make authenticated request to Naver SearchAd API.
 *
 * @param path - API path (e.g. "/ncc/campaigns")
 * @param method - HTTP method
 * @param data - Request body (only sent for POST/PUT/PATCH)
 * @param params - Query parameters (passed via axios params config for proper encoding)
 * @param responseType - Axios response type. Defaults to "json"; use "text" for
 *   non-JSON payloads such as TSV report downloads so axios does not attempt to
 *   JSON-parse the body.
 */
export async function fetchWithAuth<T = unknown>(
  path: string,
  method: HttpMethod = "GET",
  data?: unknown,
  params?: Record<string, string | string[] | number | boolean | undefined>,
  responseType?: "json" | "text" | "arraybuffer"
): Promise<ApiResponse<T>> {
  const apiKey = process.env.NAVER_API_KEY;
  const secretKey = process.env.NAVER_SIGN_KEY;
  const customerId = process.env.NAVER_CUSTOMER_ID;

  if (!apiKey || !secretKey || !customerId) {
    throw new Error(
      `Missing environment variables: NAVER_API_KEY=${!!apiKey}, NAVER_SIGN_KEY=${!!secretKey}, NAVER_CUSTOMER_ID=${!!customerId}`
    );
  }

  // Strip query string from path for signature computation (Bug #1 fix)
  const pathOnly = path.split("?")[0];

  const timestamp = Date.now().toString();
  const signature = generateSignature(timestamp, method, pathOnly, secretKey);

  // Build axios config
  const config: Record<string, unknown> = {
    method,
    url: `${NAVER_API_BASE_URL}${pathOnly}`,
    headers: {
      "X-API-KEY": apiKey,
      "X-Customer": customerId,
      "X-Timestamp": timestamp,
      "X-Signature": signature,
      "Content-Type": "application/json",
    },
  };

  // Merge any inline query string params with explicit params object
  const mergedParams: Record<string, string | string[] | number | boolean> = {};
  const queryString = path.includes("?") ? path.split("?")[1] : null;
  if (queryString) {
    const parsed = new URLSearchParams(queryString);
    for (const [key, value] of parsed.entries()) {
      mergedParams[key] = value;
    }
  }
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        mergedParams[key] = value;
      }
    }
  }
  if (Object.keys(mergedParams).length > 0) {
    config.params = mergedParams;
  }

  if (responseType) {
    config.responseType = responseType;
  }

  // Only include `data` for methods that support a request body (Bug #7 fix)
  if (data !== undefined && data !== null && ["POST", "PUT", "PATCH"].includes(method)) {
    config.data = data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return axios<T>(config as any);
}
