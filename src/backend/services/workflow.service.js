import {
  createWorkflow,
  getWorkflow,
  listWorkflows,
  updateWorkflow,
  deleteWorkflow,
} from "../store/memory.store.js";

export const workflowService = {
  create(payload) {
    return createWorkflow(payload || {});
  },
  getById(id) {
    return getWorkflow(id);
  },
  list() {
    return listWorkflows();
  },
  update(id, patch) {
    return updateWorkflow(id, patch || {});
  },
  remove(id) {
    return deleteWorkflow(id);
  },
};

export default workflowService;
