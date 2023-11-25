import { useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk"
import { useEffect } from "react"
import { ErrorBanner } from "../../layout/AlertBanner"
import { Tiptap } from "../chat/ChatInput/Tiptap"
import { IconButton, Dialog, Flex, Text } from "@radix-ui/themes"
import { X } from "lucide-react"
import { useToast } from "@/hooks/useToast"

interface EditMessageModalProps {
    onClose: (refresh?: boolean) => void,
    channelMessageID: string,
    originalText: string
}

export const EditMessageModal = ({ onClose, channelMessageID, originalText }: EditMessageModalProps) => {

    const { mutate } = useSWRConfig()
    const { toast } = useToast()
    const { updateDoc, error, loading: updatingDoc, reset } = useFrappeUpdateDoc()

    useEffect(() => {
        reset()
    }, [reset])

    const onSubmit = async (html: string, json: any) => {
        return updateDoc('Raven Message', channelMessageID,
            { text: html, json }).then((d) => {
                onClose(true)
                toast({
                    title: "Message updated",
                    description: "Your message has been updated",
                    variant: "success",
                    duration: 1000,
                })
                return mutate(`get_messages_for_channel_${d.channel_id}`)

            })
    }

    return (
        <>
            <Flex justify={'between'}>
                <Dialog.Title>Edit Message</Dialog.Title>
                <Dialog.Close disabled={updatingDoc}>
                    <IconButton size='1' variant="soft" color="gray">
                        <X size='18' />
                    </IconButton>
                </Dialog.Close>
            </Flex>

            <Flex gap='2' direction='column'>
                <ErrorBanner error={error} />
                <Tiptap onMessageSend={onSubmit} messageSending={updatingDoc} defaultText={originalText} />
                <Flex justify='end'>
                    <Text size='1' color='gray'>Press <b>Enter</b> to save</Text>
                </Flex>
            </Flex>
        </>
    )
}