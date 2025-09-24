import { Badge } from "@/components/ui/badge";
import type { TodoStatusType } from "@/types/todo";

interface TodoStatusBadgeProps {
  status: TodoStatusType;
}

const statusConfig: Record<
  TodoStatusType,
  {
    label: string;
    variant: "default" | "secondary" | "success" | "warning" | "danger";
  }
> = {
  NOT_STARTED: {
    label: "未着手",
    variant: "secondary" as const,
  },
  IN_PROGRESS: {
    label: "着手中",
    variant: "warning" as const,
  },
  NOT_APPLICABLE: {
    label: "対応しない",
    variant: "default" as const,
  },
  WAITING: {
    label: "確認待ち",
    variant: "warning" as const,
  },
  COMPLETED: {
    label: "完了",
    variant: "success" as const,
  },
};

export function TodoStatusBadge({ status }: TodoStatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
