export interface INotificationProps {
    type: "warning" | "info" | "success" | "error";
    heading: string;
    show: boolean;
    message?: string;
    onDismiss?: () => void;
}
export declare const Notification: ({ type, heading, show, message, onDismiss, }: INotificationProps) => JSX.Element;
//# sourceMappingURL=Notification.d.ts.map