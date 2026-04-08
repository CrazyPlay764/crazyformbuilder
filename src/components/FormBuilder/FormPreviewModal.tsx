import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ExternalLink } from 'lucide-react';

interface FormPreviewModalProps {
  formId: string;
  isOpen: boolean;
  onClose: () => void;
}

const FormPreviewModal = ({ formId, isOpen, onClose }: FormPreviewModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-background/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Centered Modal Panel */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pointer-events-none pt-16 p-4">
        <div 
          className={`w-[900px] max-w-[95vw] h-[85vh] bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl pointer-events-auto transition-all duration-300 ease-out ${
            isAnimating 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 -translate-y-4'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h3 className="text-lg font-orbitron font-semibold text-foreground">Form Preview</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.open(`/form/${formId}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content - iframe */}
            <div className="flex-1 overflow-hidden p-4">
              <iframe
                src={`/form/${formId}?embed=true`}
                className="w-full h-full rounded-lg border border-border/30"
                title="Form Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormPreviewModal;
