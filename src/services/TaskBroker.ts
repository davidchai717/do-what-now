import TickTick from "./TickTick";

const TaskBroker = (src) => {
  switch (src) {
    case "ticktick":
      return TickTick;
    default:
      return TickTick;
  }
};

export default TaskBroker;
