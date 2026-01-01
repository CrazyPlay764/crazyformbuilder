import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, ChevronDown, ChevronUp, X } from 'lucide-react';
import { toast } from 'sonner';

interface ResponseValue {
  id: string;
  field_label: string;
  field_type: string;
  value: string;
  position: number;
}

interface FormResponse {
  id: string;
  submitted_at: string;
  respondent_email: string | null;
  values: ResponseValue[];
}

interface FormResponsesProps {
  formId: string;
  isOpen: boolean;
  onClose: () => void;
}

const FormResponses = ({ formId, isOpen, onClose }: FormResponsesProps) => {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to trigger animation
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

  useEffect(() => {
    fetchResponses();
  }, [formId]);

  const fetchResponses = async () => {
    setLoading(true);
    
    // Fetch all responses for this form
    const { data: responsesData, error: responsesError } = await supabase
      .from('form_responses')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false });

    if (responsesError) {
      console.error('Error fetching responses:', responsesError);
      setLoading(false);
      return;
    }

    if (!responsesData || responsesData.length === 0) {
      setResponses([]);
      setLoading(false);
      return;
    }

    // Fetch all values for these responses
    const responseIds = responsesData.map((r) => r.id);
    const { data: valuesData, error: valuesError } = await supabase
      .from('form_response_values')
      .select('*')
      .in('response_id', responseIds)
      .order('position');

    if (valuesError) {
      console.error('Error fetching response values:', valuesError);
    }

    // Group values by response
    const formattedResponses: FormResponse[] = responsesData.map((response) => ({
      id: response.id,
      submitted_at: response.submitted_at,
      respondent_email: response.respondent_email,
      values: (valuesData || [])
        .filter((v) => v.response_id === response.id)
        .sort((a, b) => a.position - b.position),
    }));

    setResponses(formattedResponses);
    setLoading(false);
  };

  const deleteResponse = async (responseId: string) => {
    const { error } = await supabase
      .from('form_responses')
      .delete()
      .eq('id', responseId);

    if (error) {
      toast.error('Failed to delete response');
    } else {
      toast.success('Response deleted');
      setResponses(responses.filter((r) => r.id !== responseId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const toggleExpand = (responseId: string) => {
    setExpandedResponse(expandedResponse === responseId ? null : responseId);
  };

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
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div 
          className={`w-[650px] max-w-[90vw] max-h-[85vh] bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl pointer-events-auto transition-all duration-300 ease-out ${
            isAnimating 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-4'
          }`}
        >
          <div className="flex flex-col h-full max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h3 className="text-lg font-orbitron font-semibold text-foreground">
                Responses ({responses.length})
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={fetchResponses}>
                  Refresh
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <p className="text-muted-foreground text-sm">Loading responses...</p>
              ) : responses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No responses yet</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Responses will appear here when people submit the form
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {responses.map((response, index) => (
                    <div
                      key={response.id}
                      className="bg-background/50 rounded-lg border border-border/30 overflow-hidden"
                    >
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-background/70 transition-colors"
                        onClick={() => toggleExpand(response.id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-foreground">
                            #{responses.length - index}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(response.submitted_at)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteResponse(response.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                          {expandedResponse === response.id ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {expandedResponse === response.id && (
                        <div className="px-3 pb-3 space-y-2 border-t border-border/20 pt-3">
                          {response.values.map((value) => (
                            <div key={value.id} className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">
                                {value.field_label}
                              </p>
                              <p className="text-sm text-foreground bg-background/50 rounded px-2 py-1.5">
                                {value.value || <span className="text-muted-foreground italic">Empty</span>}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormResponses;