import { useId, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
}

const BASE_CLASSES =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function Input({ label, id, type = 'text', className, disabled, ...rest }: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';

  const input = (
    <input
      id={inputId}
      type={isPassword && revealed ? 'text' : type}
      disabled={disabled}
      className={[BASE_CLASSES, isPassword && 'pr-10', className].filter(Boolean).join(' ')}
      {...rest}
    />
  );

  const hide = () => setRevealed(false);

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {isPassword ? (
        <div className="relative">
          {input}
          <button
            type="button"
            disabled={disabled}
            aria-label="Hold to reveal password"
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 select-none disabled:opacity-50"
            onPointerDown={() => setRevealed(true)}
            onPointerUp={hide}
            onPointerLeave={hide}
            onPointerCancel={hide}
            onKeyDown={e => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setRevealed(true);
              }
            }}
            onKeyUp={hide}
            onBlur={hide}
            onContextMenu={e => e.preventDefault()}
          >
            {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      ) : (
        input
      )}
    </div>
  );
}
