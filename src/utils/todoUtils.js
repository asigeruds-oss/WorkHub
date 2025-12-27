export const priorityOptions = [
  { text: "极高", value: 5 },
  { text: "高", value: 4 },
  { text: "中", value: 3 },
  { text: "低", value: 2 },
  { text: "极低", value: 1 },
];

export const statusOptions = [
  { text: "待办", value: "pending" },
  { text: "正在处理", value: "processing" },
  { text: "已挂起", value: "suspended" },
  { text: "已完成", value: "done" },
  { text: "已归档", value: "archived" },
];

export function getPriorityColor(priority) {
  switch (Number(priority)) {
    case 5:
      return "error";
    case 4:
      return "deep-orange";
    case 3:
      return "warning";
    case 2:
      return "success";
    case 1:
      return "info";
    default:
      return "grey";
  }
}

export function getPriorityLabel(priority) {
  switch (Number(priority)) {
    case 5:
      return "极高";
    case 4:
      return "高";
    case 3:
      return "中";
    case 2:
      return "低";
    case 1:
      return "极低";
    default:
      return "未设置";
  }
}

export function getStatusColor(status) {
  switch (status) {
    case "pending":
      return "grey-darken-1";
    case "processing":
      return "warning";
    case "suspended":
      return "grey";
    case "done":
      return "success";
    case "archived":
      return "grey-lighten-1";
    default:
      return "grey";
  }
}

export function getStatusIcon(status) {
  switch (status) {
    case "pending":
      return "mdi-checkbox-blank-circle-outline";
    case "processing":
      return "mdi-progress-clock";
    case "suspended":
      return "mdi-pause-circle-outline";
    case "done":
      return "mdi-check-circle-outline";
    case "archived":
      return "mdi-archive-outline";
    default:
      return "mdi-help-circle-outline";
  }
}
