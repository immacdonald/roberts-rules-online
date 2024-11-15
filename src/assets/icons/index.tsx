import { FC, SVGProps } from 'react';
import RobertsRulesOnlineIconSVG from './RobertsRulesOnlineIcon.svg?react';

const asIcon = (WrappedSVG: FC<SVGProps<SVGSVGElement>>): FC<SVGProps<SVGSVGElement>> => {
    return (props) => <WrappedSVG {...props} style={{ height: '24px' }} />;
};

export const RobertRulesOnlineIcon = asIcon(RobertsRulesOnlineIconSVG);
