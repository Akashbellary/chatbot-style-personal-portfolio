// Module declarations for packages without TypeScript definitions
declare module '@formspree/react' {
  interface FormState {
    submitting: boolean;
    succeeded: boolean;
    errors: any[];
  }

  export function useForm(formKey: string): [FormState, (e: React.FormEvent) => void];
  export function ValidationError(props: {
    prefix: string;
    field: string;
    errors: any[];
  }): JSX.Element;
}