/** @jest-environment node */
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { ApiClient } from "../../lib/api";

const { eachLike, like } = MatchersV3;

type Ticker = {
  id: string;
  symbol: string;
  name: string;
  status: string;
  last_fetched: string | null;
  error_message?: string
};

type TickerResponse = {
  data: Ticker[];
};

describe("Pact - Tickers API", () => {
  const provider = new PactV3({
    consumer: "market-data-ui",
    provider: "market-data-api",
    dir: "pacts",
    logLevel: "warn",
  });

  it("GET /api/v1/tickers - should return a list of tickers", async () => {
    provider
      .given("Tickers exist without error message")
      .uponReceiving("a request for tickers with null error_message")
      .withRequest({
        method: "GET",
        path: "/api/v1/tickers",
      })
      .willRespondWith({
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: {
          data: eachLike(
            {
              id: like("1"),
              symbol: like("AAPL"),
              name: like("Apple Inc."),
              status: like("enabled"),
              last_fetched: null,
            },
            1
          ),
        },
      });

    await provider.executeTest(async (mockServer) => {
      const client = new ApiClient(mockServer.url);
      const res = await client.get<TickerResponse>("/tickers", { requiresAuth: false });

      expect(res.status).toBe(200);
      expect(res.error).toBeUndefined();
      expect(res.data?.data.length).toBeGreaterThan(0);
    });
  });
});
