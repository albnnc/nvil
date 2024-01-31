export interface FormWidgetProps<T = unknown> {
  value?: T;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  onChange?: (value: T) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}
