import { StatusType } from "@/types";

interface StatusBadgeProps {
  status: StatusType;
}

const STATUS_CONFIG = {
  active: { label: "Actif", className: "bg-green-100 text-green-700 border-green-200" },
  pending: { label: "En attente", className: "bg-orange-100 text-orange-700 border-orange-200" },
  suspended: { label: "Suspendu", className: "bg-red-100 text-red-700 border-red-200" },
  rejected: { label: "Refusé", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5 border ${config.className}`}>
      {config.label}
    </span>
  );
}
