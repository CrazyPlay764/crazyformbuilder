import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, KeyRound, X } from "lucide-react";

export type PasswordResetBannerKind =
  | { type: "cta" }
  | { type: "sent"; email: string }
  | { type: "error"; message: string };

interface PasswordResetBannerProps {
  kind: PasswordResetBannerKind;
  loading?: boolean;
  onCreateNewPassword?: () => void;
  onSendEmail?: () => void;
  onDismiss?: () => void;
}

export function PasswordResetBanner({
  kind,
  loading,
  onCreateNewPassword,
  onSendEmail,
  onDismiss,
}: PasswordResetBannerProps) {
  const variant = kind.type === "error" ? "destructive" : "default";

  const title =
    kind.type === "cta"
      ? "Forgot your password?"
      : kind.type === "sent"
        ? "Reset email requested"
        : "Couldn't send reset email";

  const description =
    kind.type === "cta"
      ? "Click below to request an email link that lets you create a new password."
      : kind.type === "sent"
        ? `We requested a password reset email for ${kind.email}. If it doesn't arrive, check spam or send it again.`
        : kind.message;

  return (
    <div className="fixed top-4 left-1/2 z-50 w-[min(44rem,calc(100%-1.5rem))] -translate-x-1/2">
      <Alert
        variant={variant}
        className="bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/65 border-border/60 shadow-lg"
      >
        {kind.type === "cta" ? (
          <Mail className="h-4 w-4" />
        ) : (
          <KeyRound className="h-4 w-4" />
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
              <p className="truncate">{description}</p>
            </AlertDescription>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {kind.type === "cta" && (
                <Button
                  type="button"
                  variant="glow"
                  size="sm"
                  onClick={onCreateNewPassword}
                >
                  Create new password
                </Button>
              )}

              {kind.type !== "cta" && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onSendEmail}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    "Send email again"
                  )}
                </Button>
              )}

              {kind.type !== "cta" && onDismiss && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                >
                  Dismiss
                </Button>
              )}
            </div>
          </div>

          {kind.type !== "cta" && onDismiss && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={onDismiss}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
}
