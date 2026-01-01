import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { KeyRound, X } from "lucide-react";

interface PasswordResetBannerProps {
  email: string;
  countdown: number;
  onClickReset: () => void;
  onDismiss: () => void;
  isExiting?: boolean;
}

export function PasswordResetBanner({
  email,
  countdown,
  onClickReset,
  onDismiss,
  isExiting = false,
}: PasswordResetBannerProps) {
  return (
    <div 
      className={`fixed top-4 left-1/2 z-50 w-[min(44rem,calc(100%-1.5rem))] -translate-x-1/2 transition-all duration-500 ease-out ${
        isExiting 
          ? "opacity-0 -translate-y-4 scale-95" 
          : "animate-in slide-in-from-top-4 fade-in duration-300"
      }`}
    >
      <Alert className="bg-primary/95 text-primary-foreground border-primary shadow-lg">
        <KeyRound className="h-5 w-5 text-primary-foreground" />

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <AlertTitle className="text-primary-foreground font-semibold">
              Forgot your password?
            </AlertTitle>
            <AlertDescription className="text-primary-foreground/90">
              <p>Reset password for: <strong>{email}</strong></p>
              <p className="text-sm mt-1">This button will disappear in {countdown} seconds</p>
            </AlertDescription>

            <div className="mt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClickReset}
                className="font-semibold"
              >
                Click to change the password
              </Button>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}
