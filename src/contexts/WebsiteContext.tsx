import { createContext, FC, ReactElement, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { socket } from '../socket';
import { CommitteeData, MotionData } from 'types';

interface WebsiteContextInterface {
    user: any;
    setUser: (user: any) => void;
    isLoggedIn: boolean;
    setCommittees: (data: CommitteeData[]) => void;
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
    const [committees, setCommitteesInternal] = useState<CommitteeData[]>([]);

    const committeesRef = useRef<CommitteeData[]>([]);

    const logout = (): void => {
        setUser(null);
        localStorage.removeItem('token');
    };

    const isLoggedIn = useMemo(() => !!user, [user]);

    const [previousCommitee, setPreviousCommitee] = useState<string | null>(null);
    const [currentCommitteeId, setCurrentCommitteeId] = useState<string | null>(null);

    const currentCommitteeRef = useRef<CommitteeData | null>(null);

    const setCurrentCommittee = (id: string | null) => {
        setCurrentCommitteeId(id);
    };

    const setCommitteeMotions = (motions: MotionData[]) => {
        const current = currentCommitteeRef.current;
        console.log("Setting motions");
        if (current) {
            console.log("Setting motions");
            const updatedCommittee = { ...current, motions };
            currentCommitteeRef.current = updatedCommittee;
            console.log(updatedCommittee);
            const newCommittees = committees.filter((commitee) => commitee.id != current.id);
            setCommittees([...newCommittees, updatedCommittee])
        }
    };

    const currentCommittee = useMemo(() => {
        console.log("Update current committee motions");
        if (committees && currentCommitteeId) {
            const committee = committees.find((committee) => committee.id === currentCommitteeId) ?? null;
            currentCommitteeRef.current = committee;
            return committee
        } else {
            currentCommitteeRef.current = null;
            return null;
        }
    }, [currentCommitteeId, committees])

    const setCommittees = (data: CommitteeData[]) => {
        const withMotions = data.map((committee: CommitteeData) => ({ ...committee, motions: [] }))
        setCommitteesInternal(withMotions);
        committeesRef.current = withMotions;
    }

    useEffect(() => {
        if (currentCommittee) {
            if (currentCommittee.id !== previousCommitee) {
                socket!.emit("getMotions", currentCommittee.id);
            }
        }
        setPreviousCommitee(currentCommittee ? currentCommittee.id : null);
    }, [currentCommittee]);

    return (
        <WebsiteContext.Provider value={{ user, setUser, isLoggedIn, logout, committees, setCommittees, currentCommittee, setCurrentCommittee, setCommitteeMotions }}>
            {children}
        </WebsiteContext.Provider>
    );
};

export { WebsiteContext, WebsiteContextProvider };
export type { WebsiteContextInterface };
