import { createContext, Dispatch, FC, ReactElement, ReactNode, SetStateAction, useMemo, useState } from 'react';
import { CommitteeData } from 'types';

interface WebsiteContextInterface {
    user: any;
    setUser: (user: any) => void;
    isLoggedIn: boolean;
    setCommittees: Dispatch<SetStateAction<CommitteeData[]>>;
    committees: CommitteeData[];
    currentCommittee: CommitteeData | null;
    setCurrentCommittee: (id: string | null) => void;
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
            setCurrentCommitteeInternal(committee);
        } else {
            setCurrentCommitteeInternal(null);
        }
    };

    return <WebsiteContext.Provider value={{ user, setUser, isLoggedIn, logout, committees, setCommittees, currentCommittee, setCurrentCommittee }}>{children}</WebsiteContext.Provider>;
};

export { WebsiteContext, WebsiteContextProvider };
export type { WebsiteContextInterface };
