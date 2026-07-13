// Typed endpoint functions — the single place every backend path lives.
// Components call these instead of constructing raw paths.
import {
  authedDelete,
  authedGet,
  authedPost,
  postJSON,
} from "./client";
import type {
  CreateOrgInput,
  CreateOrgResponse,
  CreateUserInput,
  CreateUserResponse,
  LoginInput,
  LoginResponse,
  LogEntry,
  Org,
  OrgDetail,
  ResetPasswordResponse,
  Stats,
  User,
} from "@/types";

export const auth = {
  login: (body: LoginInput) => postJSON<LoginResponse>("/auth/login", body),
};

export const admin = {
  getStats: () => authedGet<Stats>("/admin/stats"),

  listOrgs: () => authedGet<Org[]>("/admin/orgs"),
  getOrg: (id: string) => authedGet<OrgDetail>(`/admin/orgs/${id}`),
  createOrg: (body: CreateOrgInput) =>
    authedPost<CreateOrgResponse>("/admin/orgs", body),
  deleteOrg: (id: string) => authedDelete<unknown>(`/admin/orgs/${id}`),

  listUsers: () => authedGet<User[]>("/admin/users"),
  createUser: (body: CreateUserInput) =>
    authedPost<CreateUserResponse>("/admin/users", body),
  revokeUser: (id: string) => authedPost<unknown>(`/admin/users/${id}/revoke`),
  restoreUser: (id: string) => authedPost<unknown>(`/admin/users/${id}/restore`),
  resetPassword: (id: string) =>
    authedPost<ResetPasswordResponse>(`/admin/users/${id}/reset-password`),
  deleteUser: (id: string) => authedDelete<unknown>(`/admin/users/${id}`),

  listLogs: (limit: number) =>
    authedGet<LogEntry[]>(`/admin/logs?limit=${limit}`),
};
