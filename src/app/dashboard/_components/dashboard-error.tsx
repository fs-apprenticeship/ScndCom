import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export type DashboardErrorData = {
  description: string;
  title: string;
};

/** Renders a dashboard-level failure with a consistent destructive style. */
export function DashboardError({
  description,
  title,
}: Readonly<DashboardErrorData>) {
  return (
    <Alert className="mx-auto max-w-2xl" variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
