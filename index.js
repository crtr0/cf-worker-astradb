export default {
    async fetch(request, env, ctx) {
      const url = `${env.ASTRA_DB_API_ENDPOINT}/api/json/v1/${env.ASTRA_DB_KEYSPACE}/${env.ASTRA_DB_COLLECTION}`;
  
      // gatherResponse returns both content-type & response body as a string
      async function gatherResponse(response) {
        const { headers } = response;
        const contentType = headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          return { contentType, result: JSON.stringify(await response.json()) };
        }
        return { contentType, result: response.text() };
      }
  
      const response = await fetch(url, {
        headers: {
            "Token": env.ASTRA_DB_APPLICATION_TOKEN,
            "Content-Type": "application/json",
            "Accepts": "application/json"
        },
        method: 'POST',
        body: JSON.stringify({
            "find": {
              "sort" : {"$vector" : [0.15, 0.1, 0.1, 0.35, 0.55]},
              "projection" : {"$vector" : 1},
              "options" : {
                  "includeSimilarity" : true,
                  "limit" : 100
              }
        }})
      });
      const { contentType, result } = await gatherResponse(response);
  
      const options = { headers: { "content-type": contentType } };
      return new Response(result, options);
    },
  };