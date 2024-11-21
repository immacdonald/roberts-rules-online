import { FC, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { User } from 'server/interfaces/user';
import { Socket } from 'socket.io-client';
import { CommitteeData, MotionData } from 'types';
import { login } from '../auth';
import { Loading } from '../components';
import { selectCommittees, setCommitteeMotions, setCommittees } from '../features/committeesSlice';
import { selectUser, setUser } from '../features/userSlice';
import { disconnectSocket, initializeSocket, socket } from '../socket';

const RoutedApp: FC = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const committees = useSelector(selectCommittees);
    const committeesRef = useRef<CommitteeData[] | null>(committees);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [socketInternal, setSocketInternal] = useState<Socket | null>(null);

    // Initialize the app and check whether the user session should be resumed
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            login(undefined, undefined, token).then((user: User | null) => {
                if (user) {
                    dispatch(setUser(user));

                    const maxCommitteeWaitTime = 5000;
                    const committeeRetryDelay = 100;

                    const startTime = Date.now();

                    const interval = setInterval(() => {
                        if (committeesRef.current || Date.now() - startTime >= maxCommitteeWaitTime) {
                            clearInterval(interval);
                            setIsLoading(false);
                        }
                    }, committeeRetryDelay);
                } else {
                    localStorage.removeItem('token');
                    setIsLoading(false);
                }
            });
        } else {
            setIsLoading(false);
        }

        const debugSocket = (e: Event): void => {
            if ((e as KeyboardEvent).key === 'q') {
                socket?.emit('test');
            }
        };

        document.addEventListener('keydown', debugSocket);

        return (): void => {
            document.removeEventListener('keydown', debugSocket);
        };
    }, []);

    useEffect(() => {
        if (user) {
            setSocketInternal(initializeSocket());
        } else {
            disconnectSocket();
            setSocketInternal(null);
        }
    }, [user]);

    useEffect(() => {
        // Keep the ref updated with the latest value of committees to avoid stale data
        committeesRef.current = committees;
    }, [committees]);

    // Update socket listeners each time the socket is opened or closed
    useEffect(() => {
        if (socket) {
            // Register socket event listeners
            socket.on('chatMessage', (msg: any) => {
                console.log('Message:', msg);
            });

            socket.on('setCommittees', (committees: CommitteeData[]) => {
                //console.log('Got committees', committees);
                dispatch(setCommittees(committees));
            });

            socket.on('setMotions', (motions: MotionData[]) => {
                console.log('Setting motions', motions);
                dispatch(setCommitteeMotions(motions));
            });

            socket!.emit('getCommittees');
        }

        // Cleanup function to remove listeners if socket changes or on component unmount
        return (): void => {
            if (socket) {
                socket.off('chatMessage');
                socket.off('setCommittees');
                socket.off('setMotions');
            }
        };
    }, [socketInternal]);

    if (isLoading) {
        return <Loading />;
    }

    return <Outlet />;
};

export { RoutedApp };
