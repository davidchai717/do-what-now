const axios = require("axios");

/**
 * Forked from https://github.com/ArthurDelamare/ticktick-api
 * Credits to @ArthurDelamare
 */

class TickTickService {
  constructor() {}

  /**
   * Login to TickTick, necessary to make any other request
   * @param {Object} credentials
   * @param {string} credentials.username
   * @param {string} credentials.password
   */
  async login({ username, password }) {
    const url = "https://ticktick.com/api/v2/user/signon?wc=true&remember=true";

    const options = {
      username: username,
      password: password,
    };
    const result = await axios.post(url, options, {
      headers: { "Content-Type": "application/json" },
    });

    this.cookies = result.headers["set-cookie"];
    this.cookieHeader = this.cookies.join("; ") + ";";

    return result;
  }

  /**
   * @description send a request to https://ticktick.com/api/v2/batch/check/{id} endpoint
   * @param {number} id
   */
  async _batchCheck(id = 0) {
    if (!this.cookieHeader) {
      throw new Error("Cookie header is not set.");
    }
    const url = `https://ticktick.com/api/v2/batch/check/${id}`;

    return axios.get(url, {
      headers: {
        Cookie: this.cookieHeader,
      },
    });
  }

  /**
   * @param {Object[]} projectProfiles an Array of project details
   * @param {string} projectProfiles[].id project ID
   * @param {string} projectProfiles[].name project name
   * @param {string} projectProfiles[].modifiedTime date of the project last modification
   * @param {string} name
   */
  _getProjectIdFromProjectProfiles(projectProfiles, name = "Ligue") {
    if (!projectProfiles || projectProfiles.length === 0) {
      throw new Error("No project has been found.");
    }
    const project = projectProfiles.find((project) => project.name === name);
    if (!project) {
      throw new Error(`${name} project was not found.`);
    }
    return project.id;
  }

  /**
   * @param {Object} options
   * @param {string} options.name name of the project
   * @param {number} options.status 0 = uncompleted tasks, 2 = completed tasks
   *
   */
  async getTasks({ name, status }) {
    const batch = await this._batchCheck(1);

    if (
      !batch.data.syncTaskBean.update ||
      batch.data.syncTaskBean.update.length === 0
    ) {
      throw new Error("Task list was empty.");
    }

    let tasks = batch.data.syncTaskBean.update;

    if (name) {
      const projectId = this._getProjectIdFromProjectProfiles(
        batch.data["projectProfiles"],
        name
      );
      tasks = batch.data.syncTaskBean.update.filter(
        (task) => task.projectId === projectId
      );
    }

    if (status != null && status != undefined) {
      tasks = tasks.filter((task) => task.status === status);
    }

    return tasks.filter(
      (task) => new Date(task.startDate) <= new Date() && task.priority === 5
    );
  }

  async getTaskTitle() {
    const tasksForToday = await this.getTasks({
      status: 0,
    });

    if (!tasksForToday.length) {
      return "All done for today!";
    }

    return "Do this>>> " + (tasksForToday[0]?.title || "N/A") + " <<<";
  }
}

module.exports = TickTickService;
