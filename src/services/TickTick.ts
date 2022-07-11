import axios from "axios";
import fs from "fs/promises";
import path from "path";

const COOKIE_PATH = path.resolve(__dirname, "../../cookie.txt");

/**
 * Forked from https://github.com/ArthurDelamare/ticktick-api
 * Credits to @ArthurDelamare
 */

class TickTickService {
  cookieHeader: string;

  constructor() {
    this.cookieHeader = "";
  }

  async _getExistingCookie(): Promise<string> {
    try {
      const cookie = (await fs.readFile(COOKIE_PATH)).toString();
      return cookie;
    } catch (_) {
      return "";
    }
  }

  async loginWithExistingCookie() {
    const existingCookie = await this._getExistingCookie();
    if (existingCookie) {
      this.cookieHeader = existingCookie;
      return true;
    }
    return false;
  }

  /**
   * Login to TickTick, necessary to make any other request
   */
  async login({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<void> {
    try {
      const url =
        "https://api.ticktick.com/api/v2/user/signin?wc=true&remember=true";

      const options = {
        username,
        password,
      };

      const result = await axios.post(url, options, {
        headers: { "Content-Type": "application/json" },
      });

      this.cookieHeader = result.headers["set-cookie"].join("; ") + ";";

      await fs.writeFile(COOKIE_PATH, this.cookieHeader);
    } catch (e) {
      throw e?.response?.data?.errorCode || "Login error";
    }
  }

  async logout() {
    await fs.unlink(COOKIE_PATH);
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
  async getTasksFromToday({ status }: { status?: 0 | 2 }) {
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

    return tasks.filter((task) => new Date(task.startDate) <= new Date());
  }

  getTasksToPin(tasks) {
    return tasks.filter((task) => task.priority === 5);
  }

  async getTaskTitle() {
    const todayTasks = await this.getTasksFromToday({ status: 0 });
    const tasksToPin = this.getTasksToPin(todayTasks);

    if (!tasksToPin.length) {
      if (todayTasks.length) {
        return (
          "⏭ " + todayTasks.length + " more tasks to go! Pin the next task"
        );
      }
      return "✅ All done for today!";
    }

    return tasksToPin[0]?.title;
  }
}

export default new TickTickService();
