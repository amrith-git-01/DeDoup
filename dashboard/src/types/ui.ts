import type { LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'icon' | 'primary-icon';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children: ReactNode;
}

export interface ChartMetricTooltipProps {
    title: string;
    total: number;
    newCount: number;
    duplicateCount: number;
    size?: string;
}

export interface DetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    count?: number;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export interface DownloadListItemProps {
    file: {
        id: string;
        filename: string;
        size: number;
        status: 'new' | 'duplicate';
        fileCategory: string;
        fileExtension?: string;
        mimeType?: string;
        sourceDomain?: string;
        createdAt: string;
        sourcePath?: string;
        destinationPath?: string;
        originalFileId?: string;
        url?: string;
        fileHash?: string;
    };
}

export interface DropdownOption {
    value: string;
    label: string;
}

export interface DropdownProps {
    value: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
    className?: string;
    buttonClassName?: string;
    align?: 'left' | 'right';
    size?: 'sm' | 'md';
}

export interface StatCardProps {
    label: string;
    value: string | number | React.ReactNode;
    icon: LucideIcon;
    iconColor?: string;
    valueColor?: string;
}

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string | null;
    containerClassName?: string;
    onClear?: () => void;
    showPasswordToggle?: boolean;
    isPasswordVisible?: boolean;
    onTogglePassword?: () => void;
}


export type ViewMode = 'list' | 'pie' | 'bar';

export interface ViewModeToggleProps {
    value: ViewMode;
    onChange: (mode: ViewMode) => void;
    className?: string;
}