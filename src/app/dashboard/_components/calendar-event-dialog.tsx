import type { CalendarAction } from "@/baml_client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

type CalendarEventDialogProps = {
  action: CalendarAction | null;
  error: null | string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/** Presents a parsed calendar event for confirmation before it is created. */
export function CalendarEventDialog({
  action,
  error,
  loading,
  onCancel,
  onConfirm,
}: Readonly<CalendarEventDialogProps>) {
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open && !loading) onCancel();
      }}
      open={action !== null}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm calendar event</DialogTitle>
          <DialogDescription>
            Review the event before adding it to Google Calendar.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Could not create event</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {action && (
          <dl className="grid gap-3 rounded-lg bg-muted p-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Event</dt>
              <dd className="font-medium">{action.payload.title}</dd>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Starts</dt>
                <dd>{formatDateTime(action.payload.start)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Ends</dt>
                <dd>{formatDateTime(action.payload.end)}</dd>
              </div>
            </div>
            {action.payload.location && (
              <div>
                <dt className="text-muted-foreground">Location</dt>
                <dd>{action.payload.location}</dd>
              </div>
            )}
          </dl>
        )}
        <DialogFooter>
          <Button disabled={loading} onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button disabled={loading || !action} onClick={onConfirm}>
            {loading && <Spinner data-icon="inline-start" />}
            {loading ? "Creating" : "Create event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Formats an event timestamp for review while preserving invalid source text. */
function formatDateTime(value: null | string | undefined) {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
