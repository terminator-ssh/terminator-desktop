import { AlertTriangle } from 'lucide-react';
import { useEscape } from '@/hooks/useEscape';
import { Button } from '@/components/ui/button';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({ title, message, confirmText = "Delete", onConfirm, onCancel }: ConfirmModalProps) => {
  useEscape(onCancel);

  return (
    <div
      className="fixed inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-100 cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-card w-96 rounded-2xl p-6 shadow-2xl border border-destructive/30 relative animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-destructive" size={24} />
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm mb-6">{message}</p>

          <div className="flex gap-3 w-full">
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={onConfirm} variant="destructive" className="flex-1">
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
