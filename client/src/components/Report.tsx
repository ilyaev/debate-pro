import type { SessionReport } from '../types';
import { PitchPerfectReport } from './report/PitchPerfectReport';
import { EmpathyTrainerReport } from './report/EmpathyTrainerReport';
import { VeritalkReport } from './report/VeritalkReport';
import { ImpromptuReport } from './report/ImpromptuReport';
import { ProfessionalIntroReport } from './report/ProfessionalIntroReport';

interface Props {
    data: SessionReport;
    onRestart: () => void;
    transcript?: string[];
    userId?: string;
    isShared?: boolean;
}

export function Report({ data, onRestart, transcript, userId, isShared }: Props) {
    const props = { data, onRestart, transcript, sessionId: data.session_id, userId, isShared };
    switch (data.mode) {
        case 'pitch_perfect': return <PitchPerfectReport {...props} />;
        case 'empathy_trainer': return <EmpathyTrainerReport {...props} />;
        case 'veritalk': return <VeritalkReport {...props} />;
        case 'impromptu': return <ImpromptuReport {...props} />;
        case 'professional_introduction': return <ProfessionalIntroReport {...props} />;
        default: return <PitchPerfectReport {...props} />;
    }
}
