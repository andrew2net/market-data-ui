/** @jest-environment node */
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { ApiClient } from "../../lib/api";

const { like } = MatchersV3;

// Mock localStorage for node environment
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
(global as unknown as { localStorage: typeof localStorageMock }).localStorage = localStorageMock;

type LoginResponse = {
  token: string;
};

describe("Pact - Login API", () => {
  const provider = new PactV3({
    consumer: "market-data-ui",
    provider: "market-data-api",
    dir: "pacts",
    logLevel: "warn",
  });

  it("POST /api/v1/login - should return a token on successful login", async () => {
    provider
      .given("A user with valid credentials exists")
      .uponReceiving("a request to login with valid credentials")
      .withRequest({
        method: "POST",
        path: "/api/v1/login",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          email: "test@example.com",
          password: "password123",
        },
      })
      .willRespondWith({
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: {
          token: like("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"),
        },
      });

    await provider.executeTest(async (mockServer) => {
      const client = new ApiClient(mockServer.url);
      const res = await client.post<LoginResponse>(
        "/login",
        { email: "test@example.com", password: "password123" },
        { requiresAuth: false }
      );

      expect(res.status).toBe(200);
      expect(res.error).toBeUndefined();
      expect(res.data?.token).toBeDefined();
    });
  });

  it("POST /api/v1/login - should return 401 on invalid credentials", async () => {
    provider
      .given("No user with provided credentials exists")
      .uponReceiving("a request to login with invalid credentials")
      .withRequest({
        method: "POST",
        path: "/api/v1/login",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          email: "wrong@example.com",
          password: "wrongpassword",
        },
      })
      .willRespondWith({
        status: 401,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: {
          error: like("Invalid credentials"),
        },
      });

    await provider.executeTest(async (mockServer) => {
      const client = new ApiClient(mockServer.url);
      const res = await client.post<LoginResponse>(
        "/login",
        { email: "wrong@example.com", password: "wrongpassword" },
        { requiresAuth: false }
      );

      expect(res.status).toBe(401);
      expect(res.error).toBeDefined();
    });
  });
});
