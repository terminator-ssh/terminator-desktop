import { Cloud, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import EditHostModal from '../EditHostModal';
import { Host } from '../../../../shared/types';
import ConfirmModal from '../ConfirmModal';
import { useDeleteHost, useSaveHost } from '@/hooks/useData';
import {Button} from "@/components/ui/button";

interface InlineInputProps {
  value: string;
  placeholder?: string;
  className: string;
  onSave: (val: string) => void;
  onCancel: () => void;
  fullWidth?: boolean;
}

const InlineInput = ({ value, placeholder, className, onSave, onCancel, fullWidth }: InlineInputProps) => {
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.stopPropagation(); onSave(tempValue); }
    if (e.key === 'Escape') { e.stopPropagation(); onCancel(); }
  };

  return (
    <div className={`flex items-center gap-2 ${fullWidth ? 'w-full' : ''}`} onClick={(e) => e.stopPropagation()}>
      <div className={`inline-grid items-center ${fullWidth ? 'w-full' : ''}`}>
        <span className="col-start-1 row-start-1 opacity-0 px-2 py-0.5 whitespace-pre pointer-events-none font-medium text-sm">
          {tempValue || placeholder || "Placeholder"}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={tempValue}
          placeholder={placeholder}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => onSave(tempValue)}
          className={`col-start-1 row-start-1 focus:outline-none ${className} ${fullWidth ? 'w-full' : ''}`}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};

const HostCard = ({ props, onClose }: { props: Host, onClose: () => void }) => {
  const [isOptionsOpen, setOptionsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<'name' | 'host' | 'username' | null>(null);

  const deleteMutation = useDeleteHost();
  const saveMutation = useSaveHost();

  const handleDelete = () => {
    deleteMutation.mutate(props.id);
    setIsDeleteModalOpen(false);
    onClose();
  };

  const handleSaveField = (field: keyof Host, value: string) => {
    saveMutation.mutate({ ...props, [field]: value });
    setEditingField(null);
  };

  const INPUT_STYLE = "bg-sidebar border border-border focus:border-primary text-foreground rounded px-2 py-0.5";

  return (
    <>
      <div className="bg-card p-5 rounded-2xl border border-transparent hover:border-border transition-all group relative h-full flex flex-col justify-center">
        <div className="flex items-center gap-4">
          <div className="mt-1 shrink-0">
            <Cloud size={24} className="text-muted-foreground" />
          </div>

          <div className="flex-1 min-w-0 flex flex-col">

            {/* NAME */}
            <div className="h-8 flex items-center">
              {editingField === 'name' ? (
                <InlineInput
                  value={props.name}
                  placeholder="Name"
                  className={`${INPUT_STYLE} text-lg font-medium`}
                  onSave={(val) => handleSaveField('name', val)}
                  onCancel={() => setEditingField(null)}
                  fullWidth={!props.name}
                />
              ) : (
                <h3
                  className={`text-foreground font-medium text-lg truncate cursor-text border border-transparent hover:border-border -ml-1 px-1 rounded transition-colors
                            ${!props.name ? 'w-full h-full italic text-muted-foreground/50 hover:text-muted-foreground' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setEditingField('name'); }}
                  title="Click to rename"
                >
                  {props.name || "Add Label..."}
                </h3>
              )}
            </div>

            {/* HOST | USER */}
            <div className="text-muted-foreground/70 text-sm mt-1 flex flex-wrap gap-x-2 items-center h-6">

              {/* Host */}
              {editingField === 'host' ? (
                <InlineInput
                  value={props.host}
                  placeholder="Host / IP"
                  className={`${INPUT_STYLE} text-sm`}
                  onSave={(val) => handleSaveField('host', val)}
                  onCancel={() => setEditingField(null)}
                />
              ) : (
                <span
                  className="hover:text-foreground/80 cursor-text hover:bg-sidebar px-1 -ml-1 rounded transition-colors"
                  onClick={(e) => { e.stopPropagation(); setEditingField('host'); }}
                >
                        {props.host || "0.0.0.0"}
                    </span>
              )}

              <span className="text-muted-foreground/40">|</span>

              {/* User */}
              {editingField === 'username' ? (
                <InlineInput
                  value={props.username}
                  placeholder="User"
                  className={`${INPUT_STYLE} text-sm`}
                  onSave={(val) => handleSaveField('username', val)}
                  onCancel={() => setEditingField(null)}
                />
              ) : (
                <span
                  className="hover:text-foreground/80 cursor-text hover:bg-sidebar px-1 rounded transition-colors"
                  onClick={(e) => { e.stopPropagation(); setEditingField('username'); }}
                >
                        {props.username || "root"}
                    </span>
              )}
            </div>
          </div>

          <Button variant="ghost" size="icon"
                  onClick={(e) => { e.stopPropagation(); setOptionsOpen(!isOptionsOpen); }}
                  className="text-muted-foreground/70 hover:text-foreground shrink-0"
          >
            <MoreHorizontal size={20} />
          </Button>

          {isOptionsOpen && (
            <>
              <div
                className="fixed inset-0 z-10 cursor-default"
                onClick={(e) => { e.stopPropagation(); setOptionsOpen(false); }}
              />

              <div className="absolute right-12 top-4 bg-sidebar rounded-lg shadow-xl border border-border/50 overflow-hidden flex flex-col w-32 z-20">
                <Button variant="ghost" size="sm"
                        onClick={(e) => { e.stopPropagation(); setIsEditModalOpen(true); setOptionsOpen(false); }}
                        className="w-full justify-start gap-2 text-foreground/80">
                  <Edit2 size={12} /> Edit
                </Button>
                <Button variant="ghost" size="sm"
                        onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); setOptionsOpen(false); }}
                        className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 size={12} /> Delete
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <EditHostModal
          host={props}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={onClose}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmModal
          title="Delete Host?"
          message={`Are you sure you want to delete ${props.name || props.host}?`}
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
    </>
  );
};

export default HostCard;
