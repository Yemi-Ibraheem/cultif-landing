import { query } from "./_generated/server";

export const getAllCountries = query({
  args: {},
  handler: async (ctx) => {
    const list = await ctx.db.query("countries").collect();
    return list.sort((a, b) => a.name.localeCompare(b.name));
  },
});
