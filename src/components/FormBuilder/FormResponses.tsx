import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
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
}

const FormResponses = ({ formId }: FormResponsesProps) => {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="glass rounded-xl p-4">
        <h3 className="text-lg font-orbitron font-semibold text-foreground mb-4">Responses</h3>
        <p className="text-muted-foreground text-sm">Loading responses...</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-orbitron font-semibold text-foreground">
          Responses ({responses.length})
        </h3>
        <Button variant="ghost" size="sm" onClick={fetchResponses}>
          Refresh
        </Button>
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">No responses yet</p>
          <p className="text-muted-foreground text-xs mt-1">
            Responses will appear here when people submit the form
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {responses.map((response, index) => (
            <div
              key={response.id}
              className="bg-background/30 rounded-lg border border-border/30 overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-background/50 transition-colors"
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
  );
};

export default FormResponses;