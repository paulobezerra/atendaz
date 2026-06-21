import { GET } from "@/app/api/health/route";
import { createMocks } from "node-mocks-http";

describe("API Health Check Integration", () => {
  it("deve retornar status 200 e conexão com banco", async () => {
    const { req } = createMocks({
      method: "GET",
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("ok");
    expect(data.database).toBe("connected");
  });
});
