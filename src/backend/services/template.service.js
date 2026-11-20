import {
  createTemplate,
  getTemplate,
  listTemplates,
  deleteTemplate,
} from "../store/memory.store.js";

export const templateService = {
  create(payload) {
    return createTemplate(payload || {});
  },
  getById(id) {
    return getTemplate(id);
  },
  list() {
    return listTemplates();
  },
  remove(id) {
    return deleteTemplate(id);
  },
};

export default templateService;
