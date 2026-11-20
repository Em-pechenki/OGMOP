// Re-export the ESM security middleware bundle for backward compatibility.
import { applySecurity, errorHandler, getAllowedOrigins } from "./security.middleware.js";
export { applySecurity, errorHandler, getAllowedOrigins };
export default { applySecurity, errorHandler, getAllowedOrigins };