import { createContext, Dispatch, FC, ReactElement, ReactNode, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
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

    const [previousCommitee, setPreviousCommitee] = useState<string | null>(null);
    const [currentCommittee, setCurrentCommitteeInternal] = useState<CommitteeData | null>(null);

    const currentCommitteeRef = useRef<CommitteeData | null>(null);

    const setCurrentCommittee = (id: string | null) => {
        if (id && committees.length > 0) {
            const committee = (committees.find((committee) => committee.id === id) ?? null);
            console.log('Setting to committee', committee);
            if (committee) {
                const updatedCommittee = { ...committee, motions: [] };
                currentCommitteeRef.current = updatedCommittee; // Update ref immediately
                setCurrentCommitteeInternal(updatedCommittee); // Update state
            }
        } else {
            currentCommitteeRef.current = null;
            setCurrentCommitteeInternal(null);
        }
    };

    useEffect(() => {
        if (currentCommittee) {
            if (currentCommittee.id !== previousCommitee) {
                console.log("Getting motion for", currentCommittee.id);
                socket!.emit("getMotions", currentCommittee.id);
            }
        }
        setPreviousCommitee(currentCommittee ? currentCommittee.id : null);
    }, [currentCommittee]);

    const setCommitteeMotions = (motions: MotionData[]) => {
        const current = currentCommitteeRef.current;
        if (current) {
            console.log("Current committee is", current);
            console.log("Current motions are", motions);
            const updatedCommittee = { ...current, motions };
            currentCommitteeRef.current = updatedCommittee; // Update ref immediately
            setCurrentCommitteeInternal(updatedCommittee); // Update state
        }
    };

    return <WebsiteContext.Provider value={{ user, setUser, isLoggedIn, logout, committees, setCommittees, currentCommittee, setCurrentCommittee, setCommitteeMotions }}>{children}</WebsiteContext.Provider>;
};

export { WebsiteContext, WebsiteContextProvider };
export type { WebsiteContextInterface };
