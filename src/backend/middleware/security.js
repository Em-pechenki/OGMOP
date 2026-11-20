// Re-export the ESM security middleware bundle for backward compatibility.
export { applySecurity, errorHandler, getAllowedOrigins } from "./security.middleware.js";
export default { applySecurity, errorHandler, getAllowedOrigins };