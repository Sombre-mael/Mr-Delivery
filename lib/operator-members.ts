import { getSql } from "@/lib/db";

export type OperatorRole = "admin" | "operator";

export type OperatorMember = {
  email: string;
  displayName: string;
  role: OperatorRole;
  isActive: boolean;
  passwordConfigured: boolean;
  mustChangePassword: boolean;
  sessionVersion: number;
  invitedAt: string;
  lastLoginAt: string;
  passwordUpdatedAt: string;
};

export type OperatorActivity = {
  id: number;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function mapMember(row: Record<string, unknown>): OperatorMember {
  return {
    email: String(row.email),
    displayName: String(row.display_name || row.email),
    role: String(row.role) as OperatorRole,
    isActive: Boolean(row.is_active),
    passwordConfigured: Boolean(row.password_hash),
    mustChangePassword: Boolean(row.must_change_password),
    sessionVersion: Number(row.session_version || 1),
    invitedAt: String(row.invited_at || ""),
    lastLoginAt: String(row.last_login_at || ""),
    passwordUpdatedAt: String(row.password_updated_at || ""),
  };
}

export async function getOperatorMember(email: string) {
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM operator_members
    WHERE email = ${normalizeEmail(email)}
    LIMIT 1
  `) as Record<string, unknown>[];

  return rows[0] ? mapMember(rows[0]) : null;
}

export async function listOperatorMembers() {
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM operator_members
    ORDER BY is_active DESC, role ASC, display_name ASC
  `) as Record<string, unknown>[];

  return rows.map(mapMember);
}

export async function getOperatorMemberCredentials(email: string) {
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM operator_members
    WHERE email = ${normalizeEmail(email)}
    LIMIT 1
  `) as Record<string, unknown>[];

  if (!rows[0]) return null;
  return {
    member: mapMember(rows[0]),
    passwordHash: String(rows[0].password_hash || ""),
  };
}

export async function createOperatorMember(input: {
  email: string;
  displayName: string;
  role: OperatorRole;
  passwordHash: string;
}) {
  const sql = getSql();
  const email = normalizeEmail(input.email);
  const rows = (await sql`
    INSERT INTO operator_members (
      email, display_name, role, is_active, password_hash,
      must_change_password, session_version, password_updated_at
    )
    VALUES (
      ${email}, ${input.displayName.trim()}, ${input.role}, TRUE, ${input.passwordHash},
      TRUE, 1, NOW()
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING *
  `) as Record<string, unknown>[];

  return rows[0] ? mapMember(rows[0]) : null;
}

export async function setOperatorMemberActive(email: string, isActive: boolean) {
  const sql = getSql();
  await sql`
    UPDATE operator_members
    SET is_active = ${isActive}, session_version = session_version + 1, updated_at = NOW()
    WHERE email = ${normalizeEmail(email)}
  `;
}

export async function setOperatorMemberRole(email: string, role: OperatorRole) {
  const sql = getSql();
  await sql`
    UPDATE operator_members
    SET role = ${role}, session_version = session_version + 1, updated_at = NOW()
    WHERE email = ${normalizeEmail(email)}
  `;
}

export async function setOperatorMemberPassword(email: string, passwordHash: string, mustChangePassword: boolean) {
  const sql = getSql();
  const rows = (await sql`
    UPDATE operator_members
    SET password_hash = ${passwordHash},
        must_change_password = ${mustChangePassword},
        password_updated_at = NOW(),
        session_version = session_version + 1,
        updated_at = NOW()
    WHERE email = ${normalizeEmail(email)}
    RETURNING *
  `) as Record<string, unknown>[];

  return rows[0] ? mapMember(rows[0]) : null;
}

export async function markOperatorLogin(email: string) {
  const sql = getSql();
  await sql`
    UPDATE operator_members
    SET last_login_at = NOW(), updated_at = NOW()
    WHERE email = ${normalizeEmail(email)}
  `;
}

export async function logOperatorActivity(input: {
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
}) {
  const sql = getSql();
  await sql`
    INSERT INTO operator_activity_logs (actor_email, action, entity_type, entity_id, summary)
    VALUES (
      ${normalizeEmail(input.actorEmail)}, ${input.action}, ${input.entityType},
      ${input.entityId}, ${input.summary}
    )
  `;
}

export async function listOperatorActivity(limit = 40) {
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM operator_activity_logs
    ORDER BY created_at DESC
    LIMIT ${Math.min(Math.max(limit, 1), 100)}
  `) as Record<string, unknown>[];

  return rows.map((row) => ({
    id: Number(row.id),
    actorEmail: String(row.actor_email),
    action: String(row.action),
    entityType: String(row.entity_type),
    entityId: String(row.entity_id),
    summary: String(row.summary),
    createdAt: String(row.created_at),
  })) satisfies OperatorActivity[];
}
