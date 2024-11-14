import { createContext, FC, ReactElement, ReactNode, useEffect, useMemo, useState } from 'react';
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

    const logout = (): void => {
        setUser(null);
        localStorage.removeItem('token');
    };

    const isLoggedIn = useMemo(() => !!user, [user]);

    const [previousCommitee, setPreviousCommitee] = useState<string | null>(null);
    const [currentCommitteeId, setCurrentCommitteeId] = useState<string | null>(null);

    const setCurrentCommittee = (id: string | null) => {
        setCurrentCommitteeId(id);
    };

    const currentCommittee = useMemo(() => {
        if (committees && currentCommitteeId) {
            const committee = committees.find((committee) => committee.id === currentCommitteeId) ?? null;
            console.log(committee, "is current committee")
            return committee
        } else {
            return null;
        }
    }, [currentCommitteeId, committees])

    const setCommittees = (data: CommitteeData[]) => {
        const withMotions = data.map((committee: CommitteeData) => ({ ...committee, motions: [] }))
        setCommitteesInternal(withMotions);
    }

    const setCommitteeMotions = (motions: MotionData[]) => {
        console.log("Setting motions");
        if (currentCommittee) {
            console.log("Current committee motions");
            const updatedCommittee = { ...currentCommittee, motions };
            console.log(updatedCommittee);
            const newCommittees = committees.filter((commitee) => commitee.id != currentCommittee.id);
            const setTo = [...newCommittees, updatedCommittee]
            console.log(setTo);
            setCommittees(setTo)
        }
    };


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
