import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    label: string;
    value: string;
}

interface ComboBoxProps {
    value: string;
    onChange: (val: string) => void;
    options: Option[];
    placeholder?: string;
    disabled?: boolean;
    allowCustom?: boolean;
}

export function ComboBox({ value, onChange, options, placeholder, disabled, allowCustom = true }: ComboBoxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!allowCustom) {
            const opt = options.find(o => o.value === value);
            setInputValue(opt ? opt.label : (value || ""));
        } else {
            setInputValue(value || "");
        }
    }, [value, options, allowCustom]);

    // Close on click outside
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    // Also close on hitting Escape
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
        } else if (e.key === 'ArrowDown' && !isOpen) {
            setIsOpen(true);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (allowCustom) {
            setInputValue(e.target.value);
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
        }
    };

    const toggleOpen = () => {
        if (!disabled) setIsOpen(!isOpen);
    };

    const filteredOptions = allowCustom && inputValue
        ? options.filter(opt => opt.label.toLowerCase().includes(inputValue.toLowerCase()))
        : options;

    return (
        <div className={`combo-box ${disabled ? 'combo-box--disabled' : ''}`} ref={containerRef}>
            <div className="combo-box__input-wrapper" onClick={!allowCustom ? toggleOpen : undefined}>
                <input
                    type="text"
                    className={`combo-box__input ${!allowCustom ? 'combo-box__input--readonly' : ''}`}
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => { if (allowCustom) setIsOpen(true); }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={!allowCustom}
                    style={{ cursor: !allowCustom ? 'pointer' : 'text' }}
                />
                <button
                    type="button"
                    className="combo-box__toggle"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleOpen();
                    }}
                    tabIndex={-1}
                    aria-label="Toggle dropdown"
                >
                    <ChevronDown size={18} className={`combo-box__arrow ${isOpen ? 'combo-box__arrow--open' : ''}`} />
                </button>
            </div>

            {(isOpen && filteredOptions.length > 0) && (
                <div className="combo-box__dropdown">
                    {filteredOptions.map((opt, i) => (
                        <div
                            key={i}
                            className={`combo-box__option ${value === opt.value ? 'combo-box__option--selected' : ''}`}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                        >
                            <span className="combo-box__option-label">{opt.label}</span>
                            {value === opt.value && <Check size={16} className="combo-box__option-check" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
