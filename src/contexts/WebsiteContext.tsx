import { createContext, Dispatch, FC, ReactElement, ReactNode, SetStateAction, useMemo, useState } from 'react';
import { socket } from '../socket';
import { CommitteeData, MotionData } from 'types';

interface WebsiteContextInterface {
    user: any;
    setUser: (user: any) => void;
    isLoggedIn: boolean;
    setCommittees: Dispatch<SetStateAction<CommitteeData[]>>;
    committees: CommitteeData[];
    currentCommittee: CommitteeData | null;
    setCurrentCommittee: (id: string | null) => void;
    setCommitteeMotions: (motions: MotionData[]) => void;
    logout: () => void;
}

const WebsiteContext = createContext<WebsiteContextInterface | null>(null);

interface WebsiteContextProviderProps {
    children: ReactNode;
}

const WebsiteContextProvider: FC<WebsiteContextProviderProps> = ({ children }): ReactElement => {
    const [user, setUser] = useState<any>(null);
    const [committees, setCommittees] = useState<CommitteeData[]>([]);

    const logout = (): void => {
        setUser(null);
        localStorage.removeItem('token');
    };

    const isLoggedIn = useMemo(() => !!user, [user]);

    const [currentCommittee, setCurrentCommitteeInternal] = useState<CommitteeData | null>(null);

    const setCurrentCommittee = (id: string | null) => {
        if (id && committees.length > 0) {
            const committee = (committees.filter((committee) => committee.id == id) ?? [null])[0];
            console.log('Setting to committee', committee);
            socket.emit("getMotions", committee.id);
            setCurrentCommitteeInternal(committee);
        } else {
            setCurrentCommitteeInternal(null);
        }
    };

    const setCommitteeMotions = (motions: MotionData[]) => {
        if(currentCommittee) {
            console.log(motions);
            setCurrentCommitteeInternal({...currentCommittee, motions});
        }
    }

    return <WebsiteContext.Provider value={{ user, setUser, isLoggedIn, logout, committees, setCommittees, currentCommittee, setCurrentCommittee, setCommitteeMotions }}>{children}</WebsiteContext.Provider>;
};

export { WebsiteContext, WebsiteContextProvider };
export type { WebsiteContextInterface };
