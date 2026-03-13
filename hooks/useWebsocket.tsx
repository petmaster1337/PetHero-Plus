// useWebSocket.tsx
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { WEBSOCKET_URL } from '@/config';
import { getUserById } from '@/services/user.service';
import * as FileSystem from 'expo-file-system/legacy';
import { getMessages, getServices, getTrackByContract, recordPhoto, storeMessage } from '@/services/event.service';
//  import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

const CHUNK_SIZE_BYTES = 2 * 1024 * 1024;

export const useWebSocket = (
    user: any,
    setMessages: Dispatch<SetStateAction<{ sender: any[]; receiver: any[]; }>>,
    messages: { sender: any[]; receiver: any[]; },
    getCurrentAttention: any,
    services: { contractor: any[]; contractee: any[]},
    setServices: any,
    hero: any,
    token: string,
) => {
    const [ isConnected, setIsConnected ] = useState<boolean>(false);
    const [ userId, setUserId ] = useState<string | null>(null);
    const [ incomingCall, setIncomingCall ] = useState<any>(null);
    const [ filename, setFilename ] = useState<string>('');
    const [ goBack, setGoBack ] = useState<any>({});
    const [ tracks, setTracks ] = useState<any>({});
    const socketRef = useRef<WebSocket | null>(null);
    const callbackMap = useRef<Record<string, (status: boolean) => void>>({});
    const fileQueueRef = useRef<string[]>([]);

    useEffect(() => {
        if (user) setUserId(user?._id ?? null);
    }, [user]);

    useEffect(() => {
        if (!userId) return;
        connectWebSocket();
        return () => {
            try { socketRef.current?.close(); } catch(e) {}
            socketRef.current = null;
        };
    }, [userId]);

    // ---------------- WebSocket ----------------
    const connectWebSocket = () => {
        if (socketRef.current) {
            console.warn('WebSocket already connected, ignoring duplicate connection.');
            return;
        }

        console.log('Connecting WebSocket:', `${WEBSOCKET_URL}?userId=${userId}`);
        const socket = new WebSocket(`${WEBSOCKET_URL}?userId=${userId}`);

        socket.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
        };

        socket.onmessage = async (event) => {
            let data: any;
            try {
                data = JSON.parse(event.data);
            } catch (err) {
                console.warn('Invalid WS message payload', event.data);
                return;
            }

            switch (data.type) {
                case 'message':
                    setMessages((prev) => ({ ...prev, receiver: [...prev.receiver, data] }));
                    break;

                case 'message-response':
                    await rebootMessages();
                    break;
                case 'message-answer':
                    await rebootMessages();
                    await contractResponse();
                    break;
                case 'contract-response':
                    if (data.data.message === 'rebootTracks')  {
                        console.log('contract-response', JSON.stringify(event));
                        await rebootTracks(data.data.contractId);

                    }
                    else
                        await contractResponse();
                    break;

                case 'contract-update':
                    if (data.data.message === 'rebootTracks') {
                        console.log('contract-update', JSON.stringify(event));
                        await rebootTracks(data.data.contractId);
                    }
                    else
                        await contractResponse();
                    break;

                case 'check-online-response':
                    if (callbackMap.current[data.userId]) {
                        callbackMap.current[data.userId](data.status);
                        delete callbackMap.current[data.userId];
                    }
                    break;

                case 'file-response': {
                    // server sending a base64 chunk or finalization notice
                    try {
                        const payload = data.data;
                        if (payload.finalized) {
                            const fileName = payload.filename;
                            const base64String = fileQueueRef.current.join('');
                            fileQueueRef.current = []; // clear
                            const filePath = `${FileSystem.documentDirectory}${fileName}`;
                            await FileSystem.writeAsStringAsync(filePath, base64String, { encoding: 'base64' });
                            setFilename(filePath);

                            if (payload.senderId) {
                                const sender = await getUserById(payload.senderId);
                                setIncomingCall(sender);
                            }

                            setGoBack({
                                pathname: '/user/serviceDetails',
                                params: findContractParams(payload.contract)
                            });
                            await storeMessage({
                                uid: `${(Math.floor(Math.pow(32, 6) * Math.random()) + Date.now()).toString(16)}`,
                                subject: `${new Date().toLocaleString()}`,
                                message: filePath,
                                sender: payload.senderId,
                                receiver: payload.receiverId,
                                reply: 'false',
                                type: 'photo',
                                contract: payload.contract,
                                status: 'picture',
                            });
                        } else {
                            if (payload.binary) fileQueueRef.current.push(payload.binary);
                        }
                    } catch (e) {
                        console.warn('Error handling file-response', e);
                    }
                    break;
                }

                // case 'download-response':
                //     downloadVideo(data.data.videoUrl, data.data.senderId);
                //     break;

                default:
                    console.warn('Unknown event type:', data.type);
            }
        };

        socket.onerror = (error) => {
            console.log('WebSocket error:', error);
        };

        socket.onclose = () => {
            console.warn('WebSocket closed. Reconnecting in 5s...');
            setIsConnected(false);
            socketRef.current = null;
            setTimeout(connectWebSocket, 5000);
        };

        socketRef.current = socket;
    };

    // ---------------- Helpers ----------------
    const rebootMessages = async () => {
        try {
            const messageSender = await getMessages(token, 'sender', user);
            const messageReceiver = await getMessages(token, 'receiver', user);
            setMessages({ sender: messageSender, receiver: messageReceiver });
        } catch (e) {
            console.warn('rebootMessages error', e);
        }
    };

    const rebootTracks = async (contractId: string) => {
        try {
            let ts = await getTrackByContract({_id: contractId}, token);
            let newTrack = {...tracks}
            newTrack[contractId] = [...ts?.history];
            setTracks(newTrack);
        } catch (e) {
            console.warn('rebootTracks error', e);
        }
    }

    const contractResponse = async () => {
        console.log('WS 193 REBOOT CONTRACTS')
        try {
            await getCurrentAttention();
            const serviceContractor = await getServices(token, 'contractor', user, true);
            const serviceContractee = hero ? await getServices(token, 'contractee', hero, true) : [];
            setServices({ contractor: serviceContractor, contractee: serviceContractee });
        } catch (e) {
            console.warn('contractResponse error', e);
        }
    };

    const checkUserOnline = (receiverId: string, callback: (status: boolean) => void) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            callbackMap.current[receiverId] = callback;
            sendEvent('check-online', { receiverId });
        } else {
            console.warn('WebSocket is not connected.');
            callback(false);
        }
    };

    // const ensureMediaLibraryPermission = async () => {
    //     try {
    //         const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
    //         if (status === 'granted') return true;
    //         if (status === 'denied' && canAskAgain) {
    //             const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
    //             return newStatus === 'granted';
    //         }
    //         return false;
    //     } catch (e) {
    //         console.warn('ensureMediaLibraryPermission error', e);
    //         return false;
    //     }
    // };

    // const downloadVideo = async (fileUrl: string, senderId: string) => {
    //     if (!fileUrl) return;
    //     try {
    //         const sender = senderId ? await getUserById(senderId) : null;
    //         const parts = fileUrl.split('/');
    //         const fileName = parts.pop() || `download_${Date.now()}`;
    //         const targetDir = `${FileSystem.documentDirectory}Download/`;
    //         const dirInfo = await FileSystem.getInfoAsync(targetDir);
    //         if (!dirInfo.exists) {
    //             await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });
    //         }
    //         const fileUri = `${targetDir}${fileName}`;
    //         const downloadResumable = FileSystem.createDownloadResumable(fileUrl, fileUri, {});
    //         const res = await downloadResumable.downloadAsync();
    //         if (res?.uri) {
    //             setIncomingCall(sender);
    //             setFilename(res.uri);
    //             sendEvent('exclude-download', { fileUrl });
    //         }
    //     } catch (e) {
    //         console.warn('downloadVideo error', e);
    //     }
    // };

    const sendInstantMessage = (receiverId: string, message: any) => {
        sendEvent('message', { ...message, receiverId });
        return true;
    };

    const sendContractRequest = (receiverId: string, ctr: any) => {
        sendEvent('contract', { receiverId, ...ctr });
    };

    const sendReminder = (receiverId: string, data: any) => {
        const msgObj = {
            uid: String(`${(Math.floor(Math.pow(32, 6) * Math.random()) + Date.now()).toString(16)}`),
            subject: String(data.subject),
            message: JSON.stringify({subject: data.subject, contract: data.contract}),
            receiver: String(receiverId),
            reply: String(false),
            type: String('message'),
            contract: JSON.stringify(data.contract),
            status: 'sent'
        };    
        sendEvent('message', {receiverId, ...msgObj})
    }

    const sendCallRequest = (receiverId: string, action: any) => {
        sendEvent('call', { receiverId, ...action });
    };

    const sendCallAnswer = (receiverId: string, action: string) => {
        sendEvent('call-answer', { receiverId, action });
    };

    const sendEvent = (event: string, data: any) => {
        if (socketRef?.current?.readyState === WebSocket.OPEN) {
            const payload = JSON.stringify({ event, senderId: userId, ...data });
            socketRef.current.send(payload);
        } else {
            setTimeout(()=> {
                if (socketRef?.current?.readyState === WebSocket.OPEN) {        
                    const payload = JSON.stringify({ event, senderId: userId, ...data });
                    socketRef.current.send(payload);
                }
            }, 3000)
            console.warn('WebSocket is not connected.');
        }
    };

    const findContractParams = (contractId: string) => {
        const serviceList = (services?.contractor || []).concat(services?.contractee || []);
        for (const service of serviceList) {
            if (service._id === contractId) return service;
        }
        return undefined;
    };

    const compressImageUri = async (input: string | { uri: string }) => {
        try {
            const uri = typeof input === 'string' ? input : input?.uri;
            if (!uri) throw new Error('compressImageUri: invalid uri');

            if (uri.startsWith('data:')) {
                const tmpPath = `${ FileSystem.documentDirectory }tmp_image_${ Date.now() }.jpg`;
                const base64 = uri.split(',')[1] ?? '';
                await FileSystem.writeAsStringAsync(tmpPath, base64, { encoding: 'base64' });
                const manipulated = await ImageManipulator.manipulateAsync(tmpPath, [], { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG });
                return manipulated.uri;
            }

            const manipulated = await ImageManipulator.manipulateAsync(uri, [], { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG });
            return manipulated.uri;
        } catch (e) {
            console.warn('compressImageUri error', e);
            throw e;
        }
    };

    const sendPhoto = async (receiverId: string, contract: string) => {
        try {
            const getPermitions = async () => {
                await ImagePicker.requestCameraPermissionsAsync();
                await ImagePicker.requestMediaLibraryPermissionsAsync();
                return true;
            };
            await getPermitions();
            const photo = await recordPhoto();
            const uri = (typeof photo === 'string') ? photo : (photo?.uri ?? null);
            if (!uri) throw new Error('recordPhoto did not return a uri');

            const compressedUri = await compressImageUri(uri);
            const filenameOut = await sendFileThroughWebSocket(compressedUri, receiverId, 'jpg', contract);

            setGoBack({
                pathname: '/user/serviceDetails',
                params: findContractParams(contract)
            });

            await storeMessage({
                uid: filenameOut,
                subject: 'image',
                message: filenameOut,
                sender: user._id,
                receiver: receiverId,
                reply: "false",
                type: "Image",
                contract,
                status: "sent"
            });
        } catch (e) {
            console.warn('sendPhoto error', e);
        }
    };

    const base64CharsForBytes = (bytes: number) => 4 * Math.ceil(bytes / 3);
    const sendFileThroughWebSocket = async (uri: string, receiverId: string, extension: string, contract: string) => {
        try {
            if (!uri) throw new Error('sendFileThroughWebSocket: uri empty');

            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
            if (!base64) throw new Error('Failed to read file as base64');

            const chunkChars = base64CharsForBytes(CHUNK_SIZE_BYTES);
            const totalChunks = Math.ceil(base64.length / chunkChars);
            const fileName = uri.split('/').pop() || `file_${Number(Date.now()).toString(32)}`;
            for (let i = 0; i < totalChunks; i++) {
                const start = i * chunkChars;
                const end = Math.min(base64.length, start + chunkChars);
                const chunk = base64.slice(start, end);
                sendEvent('send-file', {
                    finalized: false,
                    index: i + 1,
                    totalChunks,
                    receiverId,
                    binary: chunk,
                    contract,
                    extension,
                    filename: fileName
                });

                await new Promise(res => setTimeout(res, 50));
            }

            sendEvent('send-file', { finalized: true, receiverId, extension, filename: fileName, contract });
            return fileName;
        } catch (e) {
            console.warn('sendFileThroughWebSocket error', e);
            return undefined;
        }
    };

    return {
      isConnected,
      checkUserOnline,
      sendInstantMessage,
      sendCallRequest,
      sendCallAnswer,
      sendEvent,
      sendPhoto,
      sendContractRequest,
      sendReminder,
      incomingCall,
      setIncomingCall,
      filename,
      setGoBack,
      goBack,
      tracks
    };
};
