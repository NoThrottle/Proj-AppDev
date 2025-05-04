export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/movies", "/movies/create", "/top10list"],
};