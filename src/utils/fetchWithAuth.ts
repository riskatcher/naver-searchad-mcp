import axios from "axios";
import crypto from "crypto";
import type { HttpMethod, ApiResponse } from "../types.js";

const NAVER_API_BASE_URL = "https://api.naver.com";

/**
 * Generate HMAC-SHA256 signature for Naver API authentication
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
 * Make authenticated request to Naver SearchAd API
 */
export async function fetchWithAuth<T = unknown>(
  path: string,
  method: HttpMethod = "GET",
  data: unknown = null
): Promise<ApiResponse<T>> {
  const apiKey = process.env.NAVER_API_KEY;
  const secretKey = process.env.NAVER_SIGN_KEY;
  const customerId = process.env.NAVER_CUSTOMER_ID;

  if (!apiKey || !secretKey || !customerId) {
    throw new Error(
      `Missing environment variables: NAVER_API_KEY=${!!apiKey}, NAVER_SIGN_KEY=${!!secretKey}, NAVER_CUSTOMER_ID=${!!customerId}`
    );
  }

  const timestamp = Date.now().toString();
  const signature = generateSignature(timestamp, method, path, secretKey);

  return axios<T>({
    method,
    url: `${NAVER_API_BASE_URL}${path}`,
    headers: {
      "X-API-KEY": apiKey,
      "X-Customer": customerId,
      "X-Timestamp": timestamp,
      "X-Signature": signature,
      "Content-Type": "application/json",
    },
    data,
  });
}
