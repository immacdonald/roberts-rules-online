import { FC, SVGProps } from 'react';
import BackArrowIconSVG from './back_arrow.svg?react';
import ChairIconSVG from './chair.svg?react';
import DeleteIconSVG from './delete.svg?react';
import EditIconSVG from './edit.svg?react';
import HomeIconSVG from './home.svg?react';
import RetryIconSVG from './retry.svg?react';
import RobertsRulesOnlineIconSVG from './RobertsRulesOnlineIcon.svg?react';

const asIcon = (WrappedSVG: FC<SVGProps<SVGSVGElement>>): FC<SVGProps<SVGSVGElement>> => {
    return (props) => <WrappedSVG {...props} style={{ height: '24px' }} />;
};

export const RobertRulesOnlineIcon = asIcon(RobertsRulesOnlineIconSVG);
export const BackArrowIcon = asIcon(BackArrowIconSVG);
export const ChairIcon = asIcon(ChairIconSVG);
export const DeleteIcon = asIcon(DeleteIconSVG);
export const EditIcon = asIcon(EditIconSVG);
export const HomeIcon = asIcon(HomeIconSVG);
export const RetryIcon = asIcon(RetryIconSVG);
