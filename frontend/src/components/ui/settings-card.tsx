import { ReactNode } from "react";

interface SettingsCardProps {
    title: string;
    description?: string;
    children: ReactNode;
}

export function SettingsCard({ title, description, children }: SettingsCardProps) {
    return (
        <div className="flex flex-col
                        rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-6">
                <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <div className="flex flex-col gap-4 p-6">
                {children}
            </div>
        </div>
    );
}