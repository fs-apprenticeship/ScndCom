import { KeyboardIcon } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";

type TranscriptDialogProps = {
  clarificationNeeded: boolean;
  disabled: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  onTranscriptChange: (transcript: string) => void;
  open: boolean;
  transcript: string;
};

/** Lets the user review and edit a typed or spoken request before submission. */
export function TranscriptDialog({
  clarificationNeeded,
  disabled,
  onCancel,
  onConfirm,
  onOpenChange,
  onTranscriptChange,
  open,
  transcript,
}: Readonly<TranscriptDialogProps>) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review transcript</DialogTitle>
          <DialogDescription>
            Edit anything the assistant misheard, then confirm the request.
          </DialogDescription>
        </DialogHeader>
        {clarificationNeeded && (
          <Alert>
            <KeyboardIcon />
            <AlertTitle>Calendar needs more detail</AlertTitle>
            <AlertDescription>
              Add a clear date and time for the calendar event.
            </AlertDescription>
          </Alert>
        )}
        <Textarea
          aria-label="Transcript"
          autoFocus
          disabled={disabled}
          onChange={(event) => onTranscriptChange(event.target.value)}
          placeholder="Type your request"
          rows={5}
          value={transcript}
        />
        <DialogFooter>
          <Button disabled={disabled} onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button disabled={disabled || !transcript.trim()} onClick={onConfirm}>
            {disabled && <Spinner data-icon="inline-start" />}
            {disabled ? "Sending" : "Confirm request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
