import axios from "axios";

/**
 * Forked from https://github.com/ArthurDelamare/ticktick-api
 * Credits to @ArthurDelamare
 */

class TickTickService {
  cookieHeader: string;

  constructor() {
    this.cookieHeader = "";
  }

  /**
   * Login to TickTick, necessary to make any other request
   */
  async login({ username, password }): Promise<void> {
    const url = "https://ticktick.com/api/v2/user/signon?wc=true&remember=true";

    const options = {
      username,
      password,
    };
    const result = await axios.post(url, options, {
      headers: { "Content-Type": "application/json" },
    });

    this.cookieHeader = result.headers["set-cookie"].join("; ") + ";";
  }

  /**
   * @description send a request to https://ticktick.com/api/v2/batch/check/{id} endpoint
   * @param {number} id
   */
  async _batchCheck(id: number = 0) {
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
   * 0 = uncompleted tasks, 2 = completed tasks
   */
  async getTasks({ status }: { status?: 0 | 2 }) {
    const batch = await this._batchCheck(1);

    if (
      !batch.data.syncTaskBean.update ||
      batch.data.syncTaskBean.update.length === 0
    ) {
      throw new Error("Task list was empty.");
    }

    let tasks = batch.data.syncTaskBean.update;

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

export default TickTickService;
