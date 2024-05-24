import { useCallback, useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { RootState } from "../../../redux/store";
import { useSocket } from "../../../context/SocketProvider";
import peerService from '../../../webRTC/peer'
import VideoSession from "./VideoSession";
import { useGetUserByIdQuery } from "../../../redux/features/user/user/profileApiSlice";
import useLiveChat from "./LiveChat/useLiveChat";
import endPeerConnectionHandler from "../../../webRTC/endPeerConnectionHandler";





function VideoSessionLogic() {

    const socket = useSocket()
    const { userData } = useSelector((state: RootState) => state.user)
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)

    const location = useLocation();
    const { remoteUserId: remoteUserIdFromLink, audioEnabled: audio, videoEnabled: video, type, startTime } = location.state;
    const [remoteUserId, setRemoteUserId] = useState(remoteUserIdFromLink)


    const navigate = useNavigate()
    const { sessionId = '' } = useParams()


    const role = useRef(type)
    const { data } = useGetUserByIdQuery({ userId: remoteUserId })


    //HANDLE VOLATILE CHAT DURING VIDEO SESSION
    const { handleSendMessage, messages } = useLiveChat(data?.data);

    const handleCallUser = useCallback(async ({ remoteUserId }: { remoteUserId: string }) => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: audio,
            video: video
        })
        setLocalStream(stream)

        const offer = await peerService.getOffer()

        socket?.emit('session:call-user', { from: userData?.id, to: remoteUserId, offer })

    }, [audio, socket, userData?.id, video])

    const handleUserJoin = useCallback(({ userId }: { userId: string }) => {
        handleCallUser({ remoteUserId: userId })
    }, [handleCallUser])

    const handleNegoNeeded = useCallback(async () => {
        if (role.current == 'host') {
            role.current = 'client'
            return
        }

        const offer = await peerService.getOffer();
        socket?.emit('peer:nego-needed', { offer, to: remoteUserId, from: userData?.id })
    }, [remoteUserId, socket, userData?.id])

    //SETTING REMOTE STREAM
    const handleAddTrack = useCallback((ev: RTCTrackEvent) => {
        const remoteStream = ev.streams;
        setRemoteStream(remoteStream[0]);
    }, [])


    const handlePeerNegoNeeded = useCallback(async ({ from, offer }: { from: string, offer: RTCSessionDescriptionInit }) => {

        const ans = await peerService.getAnswer(offer)
        socket?.emit('peer:nego-done', { to: from, ans })
    }, [socket])

    const handlePeerNegoFinal = useCallback(async ({ ans }: { ans: RTCSessionDescriptionInit }) => {

        await peerService.setRemoteDescription(ans)
    }, [])

    const handleTermination = useCallback(({coinExchange}:{coinExchange:number})=> { 
        endPeerConnectionHandler({ localStream, peerService: peerService, remoteStream })
        if(type == 'host')
            navigate('/session-over',{state:{coinExchange}})
        else navigate(`/session-feedback/${sessionId}`,{state:{coinExchange}})
    }, [localStream, navigate, remoteStream, sessionId, type])


    const sendStreams = useCallback(async () => {
        let stream = null
        if (localStream) {
            stream = localStream
        } else {
            stream = await navigator.mediaDevices.getUserMedia({ video, audio })
            setLocalStream(stream)
        }

        for (const track of stream.getTracks()) {
            peerService.addTrack(track, stream);
        }

        setLocalStream(stream)

    }, [audio, localStream, video]);


    const handleIncommingCall = useCallback(async ({ from, offer }: { from: string, offer: RTCSessionDescriptionInit }) => {

        const ans = await peerService.getAnswer(offer)

        setRemoteUserId(from)
        socket?.emit('call:accepted', { ans, to: remoteUserId, from: userData?.id })
        sendStreams();


    }, [remoteUserId, sendStreams, socket, userData?.id])

    const handleCallAccepted = useCallback(async ({ ans }: { ans: RTCSessionDescriptionInit }) => {


        peerService.setRemoteDescription(ans)
        sendStreams()

    }, [sendStreams])


    useEffect(() => {
        if (type == 'host') {

            handleUserJoin({ userId: remoteUserId })
        }
    }, [handleUserJoin, remoteUserId, type])


    useEffect(() => {
        peerService.getPeerConnection()?.addEventListener('negotiationneeded', handleNegoNeeded)
        peerService.getPeerConnection()?.addEventListener('track', handleAddTrack)
        return () => {
            peerService.getPeerConnection()?.removeEventListener('negotiationneeded', handleNegoNeeded)
            peerService.getPeerConnection()?.removeEventListener('track', handleAddTrack)
        }
    }, [handleAddTrack, handleNegoNeeded])


    useEffect(() => {

        socket?.on('incomming:call', handleIncommingCall)
        socket?.on('call:accepted', handleCallAccepted)
        socket?.on('peer:nego-needed', handlePeerNegoNeeded)
        socket?.on('peer:nego-final', handlePeerNegoFinal)
        socket?.on('session:terminate', handleTermination)
        return () => {

            socket?.off('incomming:call', handleIncommingCall)
            socket?.off('call:accepted', handleCallAccepted)
            socket?.off('peer:nego-needed', handlePeerNegoNeeded)
            socket?.off('peer:nego-final', handlePeerNegoFinal)
        }
    }, [handleCallAccepted, handleIncommingCall, handlePeerNegoFinal, handlePeerNegoNeeded, socket])


    return (
        <VideoSession {...{ localStream, remoteStream, remoteUser: data?.data, messages, handleSendMessage, startTime: new Date(startTime).getTime() }} />
    )
}
export default VideoSessionLogic
