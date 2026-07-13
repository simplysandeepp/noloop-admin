// Shared domain types mirroring the NoLoop backend's admin API.

export type OrgType = "HOSPITAL" | "INSURER";
export type UserStatus = "ACTIVE" | "REVOKED" | string;

export interface Stats {
  orgs: number;
  hospitals: number;
  insurers: number;
  users: number;
  claims: number;
  logs: number;
}

export interface Org {
  id: string;
  name: string;
  type: OrgType;
  createdAt: string;
  employeeCount: number;
}

export interface Employee {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status?: UserStatus;
  createdAt: string;
}

export interface OrgDetail {
  id: string;
  name: string;
  type: OrgType;
  createdAt: string;
  users: Employee[];
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: UserStatus;
  createdAt: string;
  tenant: { id: string; name: string; type: OrgType } | null;
}

export interface LogEntry {
  id: string;
  action: string;
  detail: string | null;
  createdAt: string;
  tenant: { name: string; type: string } | null;
  actor: { name: string | null; email: string } | null;
}

export interface Credentials {
  email: string;
  password: string;
  role: string;
}

// --- Request inputs ---

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateOrgInput {
  type: OrgType;
  name: string;
  adminName: string;
  password?: string;
}

export interface CreateUserInput {
  tenantId: string;
  name: string;
  role?: string;
  password?: string;
}

// --- Response payloads ---

export interface LoginResponse {
  token: string;
  user: { role: string; name: string | null };
}

export interface CreateOrgResponse {
  tenant: { id: string; name: string; type: string };
  credentials: Credentials;
}

export interface CreateUserResponse {
  user: { id: string; name: string; role: string };
  credentials: { email: string; password: string; role: string };
}

export interface ResetPasswordResponse {
  credentials: { email: string; password: string };
}
