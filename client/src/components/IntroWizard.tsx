import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ComboBox } from './shared/ComboBox';

interface Preset {
    id?: string;
    presetName: string;
    organization: string;
    role: string;
    background?: string;
}

interface Props {
    userId: string;
    onStart: (context: { organization: string; role: string }) => void;
    onCancel: () => void;
}

const COMMON_ROLES = [
    { label: 'Software Engineer', value: 'Software Engineer' },
    { label: 'Product Manager', value: 'Product Manager' },
    { label: 'Designer', value: 'Designer' },
    { label: 'Data Scientist', value: 'Data Scientist' },
    { label: 'Sales Executive', value: 'Sales Executive' },
    { label: 'Marketing Manager', value: 'Marketing Manager' }
];

const COMMON_ORGS = [
    { label: 'Google', value: 'Google' },
    { label: 'Facebook / Meta', value: 'Facebook / Meta' },
    { label: 'Amazon', value: 'Amazon' },
    { label: 'Apple', value: 'Apple' },
    { label: 'Microsoft', value: 'Microsoft' },
    { label: 'Startup (Series A)', value: 'Startup (Series A)' },
    { label: 'Local Business', value: 'Local Business' }
];

const getRandomOrg = () => COMMON_ORGS[Math.floor(Math.random() * COMMON_ORGS.length)].value;
const getRandomRole = () => COMMON_ROLES[Math.floor(Math.random() * COMMON_ROLES.length)].value;

export function IntroWizard({ userId, onStart, onCancel }: Props) {
    const [presets, setPresets] = useState<Preset[]>([]);
    const [selectedPresetId, setSelectedPresetId] = useState<string>('new');
    const [formData, setFormData] = useState<Preset>({
        presetName: '',
        organization: '',
        role: '',
        background: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const apiBase = import.meta.env.VITE_API_URL ?? '';
        fetch(`${apiBase}/api/sessions/presets?userId=${encodeURIComponent(userId)}`)
            .then(r => r.ok ? r.json() : [])
            .then(data => {
                setPresets(data);
                if (data.length > 0) {
                    const first = data[0];
                    setSelectedPresetId(first.id!);
                    setFormData(first);
                } else {
                    // Set random initial values
                    setFormData(prev => ({ ...prev, organization: getRandomOrg(), role: getRandomRole() }));
                }
            })
            .catch(err => {
                console.error(err);
                setFormData(prev => ({ ...prev, organization: getRandomOrg(), role: getRandomRole() }));
            });
    }, [userId]);

    const handlePresetChangeVal = (id: string) => {
        setSelectedPresetId(id);
        if (id === 'new') {
            setFormData({ presetName: '', organization: getRandomOrg(), role: getRandomRole(), background: '' });
        } else {
            const preset = presets.find(p => p.id === id);
            if (preset) setFormData(preset);
        }
    };

    // Keep the preset dropdown in sync with manual field edits
    useEffect(() => {
        // Find if current organization/role perfectly matches a known preset
        const matchedPreset = presets.find(
            p => p.organization.toLowerCase() === formData.organization.toLowerCase() &&
                p.role.toLowerCase() === formData.role.toLowerCase()
        );

        if (matchedPreset) {
            setSelectedPresetId(matchedPreset.id!);
        } else {
            setSelectedPresetId('new');
        }
    }, [formData.organization, formData.role, presets]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.organization || !formData.role) return;

        setLoading(true);

        try {
            if (selectedPresetId === 'new') {
                // Save new preset
                const apiBase = import.meta.env.VITE_API_URL ?? '';
                await fetch(`${apiBase}/api/sessions/presets`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, userId, presetName: formData.organization + ' - ' + formData.role }),
                });
            }
            onStart({ organization: formData.organization, role: formData.role });
        } catch (err) {
            console.error('Failed to save preset', err);
            // Start anyway
            onStart({ organization: formData.organization, role: formData.role });
        } finally {
            setLoading(false);
        }
    };

    const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onCancel();
    };

    const labelStyle: React.CSSProperties = {
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        marginBottom: '6px',
        display: 'block'
    };

    const presetOptions = [
        { label: '+ Create New Scenario', value: 'new' },
        ...presets.map(p => ({
            label: p.presetName || `${p.organization} - ${p.role}`,
            value: p.id!
        }))
    ];

    return (
        <div className="share-modal__backdrop" onClick={handleBackdrop}>
            <div className="share-modal" style={{ padding: 'var(--space-xl)', overflow: 'visible' }}>
                <button className="share-modal__close" onClick={onCancel} aria-label="Close">
                    <X size={24} />
                </button>

                <h2 className="share-modal__title">Setup Introduction</h2>
                <p className="share-modal__subtitle">Tell the AI who you are introducing yourself to.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', marginTop: 'var(--space-md)' }}>
                    {presets.length > 0 && (
                        <div>
                            <label style={labelStyle}>Previous Scenarios</label>
                            <ComboBox
                                value={selectedPresetId}
                                onChange={handlePresetChangeVal}
                                options={presetOptions}
                                placeholder="Select a previous scenario..."
                                allowCustom={false}
                            />
                        </div>
                    )}

                    <div>
                        <label style={labelStyle}>
                            Target Organization <span style={{ color: 'var(--accent-orange)' }}>*</span>
                        </label>
                        <ComboBox
                            value={formData.organization}
                            onChange={(val) => setFormData({ ...formData, organization: val })}
                            options={COMMON_ORGS}
                            placeholder="e.g. Acme Corp, Local Meetup"
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>
                            Target Role / Context <span style={{ color: 'var(--accent-orange)' }}>*</span>
                        </label>
                        <ComboBox
                            value={formData.role}
                            onChange={(val) => setFormData({ ...formData, role: val })}
                            options={COMMON_ROLES}
                            placeholder="e.g. Senior Software Engineer"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!formData.organization || !formData.role || loading}
                        className="btn btn--primary"
                        style={{
                            marginTop: 'var(--space-md)',
                            width: '100%',
                            background: 'var(--accent-orange)',
                            borderColor: 'var(--accent-orange)',
                            opacity: (!formData.organization || !formData.role) ? 0.5 : 1
                        }}
                    >
                        {loading ? 'Starting...' : 'Start Session'}
                    </button>
                </form>
            </div>
        </div>
    );
}
