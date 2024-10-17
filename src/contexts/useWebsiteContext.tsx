import { useContext } from 'react';
import { WebsiteContext, WebsiteContextInterface } from './WebsiteContext';

const useWebsiteContext = (): WebsiteContextInterface => {
    const context = useContext(WebsiteContext);

    if (context === undefined) {
        throw new Error('useWebsiteContext was used outside of its Provider');
    } else if (!context) {
        console.warn('useWebsiteContext is null');
    }

    return context!;
};

export { useWebsiteContext };
