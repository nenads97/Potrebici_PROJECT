import { Filter, Search } from "lucide-react";

import { adminStatusLabels } from "../data/adminMock.data";
import type { AdminWorkflowStatus } from "../types/admin.types";

export type AdminCardFeedback = {
  tone: "pending" | "success" | "error";
  message: string;
};

const workflowStatuses: AdminWorkflowStatus[] = ["new", "contacted", "closed"];

type EmptyAdminListProps = {
  title: string;
  text: string;
};

export const EmptyAdminList = ({ title, text }: EmptyAdminListProps) => {
  return (
    <div className="admin-empty-state">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
};

type AdminToolbarProps = {
  query: string;
  statusFilter: "all" | AdminWorkflowStatus;
  onQueryChange: (query: string) => void;
  onStatusFilterChange: (status: "all" | AdminWorkflowStatus) => void;
};

export const AdminToolbar = ({
  query,
  statusFilter,
  onQueryChange,
  onStatusFilterChange,
}: AdminToolbarProps) => {
  return (
    <div className="admin-toolbar">
      <label className="admin-search">
        <Search />
        <span className="sr-only">Pretraga</span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Pretraga po imenu, telefonu, emailu ili poruci"
        />
      </label>

      <label className="admin-filter">
        <Filter />
        <span>Status</span>
        <select
          value={statusFilter}
          onChange={(event) =>
            onStatusFilterChange(event.target.value as "all" | AdminWorkflowStatus)
          }
        >
          <option value="all">Svi statusi</option>
          {workflowStatuses.map((status) => (
            <option key={status} value={status}>
              {adminStatusLabels[status]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

type WorkflowSelectProps = {
  value: AdminWorkflowStatus;
  onChange: (status: AdminWorkflowStatus) => void;
};

export const WorkflowSelect = ({ value, onChange }: WorkflowSelectProps) => {
  return (
    <label className="admin-inline-select">
      <span>Status</span>
      <select value={value} onChange={(event) => onChange(event.target.value as AdminWorkflowStatus)}>
        {workflowStatuses.map((status) => (
          <option key={status} value={status}>
            {adminStatusLabels[status]}
          </option>
        ))}
      </select>
    </label>
  );
};

export const AdminCardFeedbackMessage = ({ feedback }: { feedback?: AdminCardFeedback }) => {
  if (!feedback) {
    return null;
  }

  return (
    <p
      className={`admin-card-feedback admin-card-feedback--${feedback.tone}`}
      role={feedback.tone === "error" ? "alert" : "status"}
      aria-live={feedback.tone === "error" ? "assertive" : "polite"}
    >
      {feedback.message}
    </p>
  );
};
