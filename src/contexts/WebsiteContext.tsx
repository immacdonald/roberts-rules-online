import { createContext, FC, ReactElement, ReactNode, useMemo, useState } from 'react';

interface WebsiteContextInterface {
    user: any;
    setUser: (user: any) => void;
    isLoggedIn: boolean;
    logout: () => void;
}

const WebsiteContext = createContext<WebsiteContextInterface | null>(null);

interface WebsiteContextProviderProps {
    children: ReactNode;
}

const WebsiteContextProvider: FC<WebsiteContextProviderProps> = ({ children }): ReactElement => {
    const [user, setUser] = useState<any>(null);

    const logout = (): void => {
        setUser(null);
        localStorage.removeItem('token');
    };

    const isLoggedIn = useMemo(() => !!user, [user]);

    return <WebsiteContext.Provider value={{ user, setUser, isLoggedIn, logout }}>{children}</WebsiteContext.Provider>;
};

export { WebsiteContext, WebsiteContextProvider };
export type { WebsiteContextInterface };
