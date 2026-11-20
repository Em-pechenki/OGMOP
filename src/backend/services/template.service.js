import {
  createTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
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
  update(id, patch) {
    return updateTemplate(id, patch || {});
  },
  remove(id) {
    return deleteTemplate(id);
  },
};

export default templateService;
