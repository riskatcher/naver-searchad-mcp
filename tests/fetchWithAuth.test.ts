import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";

// Mock axios
vi.mock("axios");
const mockedAxios = vi.mocked(axios);

// Import after mocking
const { fetchWithAuth } = await import("../src/utils/fetchWithAuth.js");

describe("fetchWithAuth", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = {
      ...originalEnv,
      NAVER_API_KEY: "test-api-key",
      NAVER_SIGN_KEY: "test-secret-key",
      NAVER_CUSTOMER_ID: "test-customer-id",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should throw error when NAVER_API_KEY is missing", async () => {
    delete process.env.NAVER_API_KEY;

    await expect(fetchWithAuth("/ncc/campaigns")).rejects.toThrow(
      "Missing environment variables"
    );
  });

  it("should throw error when NAVER_SIGN_KEY is missing", async () => {
    delete process.env.NAVER_SIGN_KEY;

    await expect(fetchWithAuth("/ncc/campaigns")).rejects.toThrow(
      "Missing environment variables"
    );
  });

  it("should throw error when NAVER_CUSTOMER_ID is missing", async () => {
    delete process.env.NAVER_CUSTOMER_ID;

    await expect(fetchWithAuth("/ncc/campaigns")).rejects.toThrow(
      "Missing environment variables"
    );
  });

  it("should make GET request with correct headers", async () => {
    const mockResponse = { data: [{ id: "1", name: "Campaign 1" }] };
    mockedAxios.mockResolvedValueOnce(mockResponse);

    const result = await fetchWithAuth("/ncc/campaigns");

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "https://api.naver.com/ncc/campaigns",
        headers: expect.objectContaining({
          "X-API-KEY": "test-api-key",
          "X-Customer": "test-customer-id",
          "Content-Type": "application/json",
        }),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it("should make POST request with data", async () => {
    const mockResponse = { data: { id: "1", name: "New Campaign" } };
    const postData = { name: "New Campaign", campaignTp: "WEB_SITE" };
    mockedAxios.mockResolvedValueOnce(mockResponse);

    const result = await fetchWithAuth("/ncc/campaigns", "POST", postData);

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "https://api.naver.com/ncc/campaigns",
        data: postData,
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it("should make DELETE request", async () => {
    const mockResponse = { data: { success: true } };
    mockedAxios.mockResolvedValueOnce(mockResponse);

    const result = await fetchWithAuth("/ncc/campaigns/123", "DELETE");

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        url: "https://api.naver.com/ncc/campaigns/123",
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it("should include X-Timestamp header", async () => {
    const mockResponse = { data: [] };
    mockedAxios.mockResolvedValueOnce(mockResponse);

    await fetchWithAuth("/ncc/campaigns");

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Timestamp": expect.any(String),
        }),
      })
    );
  });

  it("should include X-Signature header", async () => {
    const mockResponse = { data: [] };
    mockedAxios.mockResolvedValueOnce(mockResponse);

    await fetchWithAuth("/ncc/campaigns");

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Signature": expect.any(String),
        }),
      })
    );
  });
});
