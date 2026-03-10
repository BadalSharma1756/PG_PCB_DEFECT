export interface Defect {
  id: string;
  timestamp: string;
  plant: "NGM" | "PGTL";
  location: string;
  line: string;
  shift: string;
  unitType: "IDU" | "ODU";
  defect: string;
  severity: "Major" | "Minor";
  action: "Scrap" | "Repair";
  employeeName: string;
  employeeId: string;
  quantity: number;
  remark: string;
  model: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  plant: "NGM" | "PGTL";
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  approvedAt?: string;
  assignedAdminEmail: string;
}

export interface EmployeeUser {
  id: string;
  employeeId: string;
  password: string;
  name: string;
  location: string;
  createdByAdminEmail: string;
  createdAt: string;
  hasLoggedInBefore: boolean;
}

export interface SessionRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  location: string;
  createdByAdminEmail: string;
  requestedAt: string;
  status: "pending" | "approved";
  approvedAt?: string;
}
