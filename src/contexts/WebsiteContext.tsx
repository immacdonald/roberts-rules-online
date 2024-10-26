import { createContext, Dispatch, FC, ReactElement, ReactNode, SetStateAction, useMemo, useState } from 'react';
import { CommitteeData } from 'types';

interface WebsiteContextInterface {
    user: any;
    setUser: (user: any) => void;
    isLoggedIn: boolean;
    setCommittees: Dispatch<SetStateAction<CommitteeData[]>>;
    committees: CommitteeData[];
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

    return <WebsiteContext.Provider value={{ user, setUser, isLoggedIn, logout, committees, setCommittees }}>{children}</WebsiteContext.Provider>;
};

export { WebsiteContext, WebsiteContextProvider };
export type { WebsiteContextInterface };
