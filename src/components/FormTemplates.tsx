import { FileText, ClipboardList, MessageSquare, UserCheck, Calendar, Star, ShoppingCart, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  fields: Array<{
    type: string;
    label: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
  }>;
}

const templates: FormTemplate[] = [
  {
    id: 'contact',
    name: 'Contact Form',
    description: 'Simple contact form with name, email, and message',
    icon: <MessageSquare className="w-6 h-6" />,
    fields: [
      { type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
      { type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email' },
      { type: 'text', label: 'Subject', required: false, placeholder: 'What is this about?' },
      { type: 'textarea', label: 'Message', required: true, placeholder: 'Write your message here...' },
    ],
  },
  {
    id: 'feedback',
    name: 'Feedback Form',
    description: 'Collect feedback and ratings from users',
    icon: <Star className="w-6 h-6" />,
    fields: [
      { type: 'text', label: 'Your Name', required: false, placeholder: 'Enter your name' },
      { type: 'email', label: 'Email', required: false, placeholder: 'Enter your email' },
      { type: 'radio', label: 'Rating', required: true, options: ['Excellent', 'Good', 'Average', 'Poor'] },
      { type: 'textarea', label: 'Comments', required: false, placeholder: 'Share your feedback...' },
    ],
  },
  {
    id: 'registration',
    name: 'Registration Form',
    description: 'Event or service registration form',
    icon: <UserCheck className="w-6 h-6" />,
    fields: [
      { type: 'text', label: 'First Name', required: true, placeholder: 'Enter first name' },
      { type: 'text', label: 'Last Name', required: true, placeholder: 'Enter last name' },
      { type: 'email', label: 'Email', required: true, placeholder: 'Enter your email' },
      { type: 'text', label: 'Phone Number', required: false, placeholder: 'Enter phone number' },
      { type: 'dropdown', label: 'How did you hear about us?', required: false, options: ['Social Media', 'Friend', 'Google', 'Other'] },
    ],
  },
  {
    id: 'survey',
    name: 'Survey',
    description: 'Multi-question survey with various field types',
    icon: <ClipboardList className="w-6 h-6" />,
    fields: [
      { type: 'section', label: 'About You', required: false },
      { type: 'text', label: 'Name', required: false, placeholder: 'Your name' },
      { type: 'number', label: 'Age', required: false, placeholder: 'Your age' },
      { type: 'section', label: 'Your Opinions', required: false },
      { type: 'radio', label: 'Overall Experience', required: true, options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Unsatisfied'] },
      { type: 'multiplechoice', label: 'Features you like', required: false, options: ['Design', 'Speed', 'Simplicity', 'Support'] },
      { type: 'textarea', label: 'Additional Comments', required: false, placeholder: 'Anything else you want to share?' },
    ],
  },
  {
    id: 'order',
    name: 'Order Form',
    description: 'Product order or request form',
    icon: <ShoppingCart className="w-6 h-6" />,
    fields: [
      { type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
      { type: 'email', label: 'Email', required: true, placeholder: 'Enter your email' },
      { type: 'text', label: 'Address', required: true, placeholder: 'Shipping address' },
      { type: 'dropdown', label: 'Product', required: true, options: ['Product A', 'Product B', 'Product C'] },
      { type: 'number', label: 'Quantity', required: true, placeholder: '1' },
      { type: 'textarea', label: 'Special Instructions', required: false, placeholder: 'Any special requests?' },
    ],
  },
  {
    id: 'rsvp',
    name: 'RSVP / Event',
    description: 'Event RSVP with date and attendance',
    icon: <Calendar className="w-6 h-6" />,
    fields: [
      { type: 'text', label: 'Name', required: true, placeholder: 'Your name' },
      { type: 'email', label: 'Email', required: true, placeholder: 'Your email' },
      { type: 'radio', label: 'Will you attend?', required: true, options: ['Yes', 'No', 'Maybe'] },
      { type: 'number', label: 'Number of Guests', required: false, placeholder: '0' },
      { type: 'textarea', label: 'Dietary Restrictions', required: false, placeholder: 'Any dietary needs?' },
    ],
  },
];

interface FormTemplatesProps {
  onSelectTemplate: (template: FormTemplate) => void;
}

const FormTemplates = ({ onSelectTemplate }: FormTemplatesProps) => {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-orbitron font-bold text-foreground mb-2">Templates</h2>
      <p className="text-sm text-muted-foreground font-inter mb-6">Start with a pre-built template to save time</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="glass glow-border rounded-xl p-5 hover:bg-card/80 transition-all duration-300 group cursor-pointer"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                {template.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-orbitron font-semibold text-foreground">{template.name}</h3>
                <p className="text-xs text-muted-foreground font-inter mt-1">{template.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{template.fields.filter(f => f.type !== 'section').length} fields</span>
              <Button variant="ghost" size="sm" className="text-xs h-7 opacity-0 group-hover:opacity-100 transition-opacity">
                Use Template
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormTemplates;
