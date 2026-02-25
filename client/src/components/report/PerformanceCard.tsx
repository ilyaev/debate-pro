import { forwardRef } from 'react';
import type { SessionReport } from '../../types';
import { PitchPerfectCard } from './cards/PitchPerfectCard';
import { EmpathyTrainerCard } from './cards/EmpathyTrainerCard';
import { VeritalkCard } from './cards/VeritalkCard';
import { ImpromptuCard } from './cards/ImpromptuCard';

interface PerformanceCardProps {
    report: SessionReport;
    isOgImage?: boolean;
    ogBackgroundImage?: string;
}

// ─── Component Router ─────────────────────────────────────────────────────────

export const PerformanceCard = forwardRef<HTMLDivElement, PerformanceCardProps>(({ report, isOgImage, ogBackgroundImage }, ref) => {
    switch (report.mode) {
        case 'pitch_perfect':
            return <PitchPerfectCard report={report} ref={ref} isOgImage={isOgImage} ogBackgroundImage={ogBackgroundImage} />;
        case 'empathy_trainer':
            return <EmpathyTrainerCard report={report} ref={ref} isOgImage={isOgImage} ogBackgroundImage={ogBackgroundImage} />;
        case 'veritalk':
            return <VeritalkCard report={report} ref={ref} isOgImage={isOgImage} ogBackgroundImage={ogBackgroundImage} />;
        case 'impromptu':
            return <ImpromptuCard report={report} ref={ref} isOgImage={isOgImage} ogBackgroundImage={ogBackgroundImage} />;
        default:
            // Fallback for unknown modes
            return <PitchPerfectCard report={report} ref={ref} isOgImage={isOgImage} ogBackgroundImage={ogBackgroundImage} />;
    }
});
