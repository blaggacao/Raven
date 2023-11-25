import { DividerWithText } from "../../../layout/Divider/DividerWithText";
import { DateObjectToFormattedDateString } from "../../../../utils/operations";
import { DateBlock, FileMessage, Message, MessageBlock, MessagesWithDate } from "../../../../../../types/Messaging/Message";
import { ChannelHistoryFirstMessage } from "../../../layout/EmptyState/EmptyState";
import { useContext, useRef } from "react";
import { ChatMessageBox } from "../chat-message/ChatMessageBox";
import { MarkdownRenderer } from "../../markdown-viewer/MarkdownRenderer";
import { FileMessageBlock } from "../chat-message/FileMessage";
import { ModalTypes, useModalManager } from "../../../../hooks/useModalManager";
import { FilePreviewModal } from "../../file-preview/FilePreviewModal";
import { Virtuoso } from 'react-virtuoso';
import { VirtuosoRefContext } from "../../../../utils/message/VirtuosoRefProvider";
import { ChannelListItem, DMChannelListItem } from "@/utils/channel/ChannelListProvider";
import { Box } from "@radix-ui/themes";

interface ChatHistoryProps {
    parsedMessages: MessagesWithDate,
    replyToMessage?: (message: Message) => void,
    channelData: ChannelListItem | DMChannelListItem
}

export const ChatHistory = ({ parsedMessages, replyToMessage, channelData }: ChatHistoryProps) => {

    const { virtuosoRef } = useContext(VirtuosoRefContext)

    const boxRef = useRef<HTMLDivElement>(null)


    const modalManager = useModalManager()

    const onFilePreviewModalOpen = (message: Partial<FileMessage>) => {
        if (message) {
            modalManager.openModal(ModalTypes.FilePreview, {
                file: message.file,
                owner: message.owner,
                creation: message.creation,
                message_type: message.message_type
            })
        }
    }

    const renderItem = (block: DateBlock | MessageBlock) => {
        if (block.block_type === 'date') {
            return (
                <Box p='4' key={block.data} className="z-10 relative">
                    <DividerWithText>{DateObjectToFormattedDateString(new Date(block.data))}</DividerWithText>
                </Box>
            )
        }
        if (block.block_type === 'message') {
            return (
                <ChatMessageBox
                    message={block.data}
                    key={block.data.name}
                    replyToMessage={replyToMessage}
                    channelData={channelData}>
                    {block.data.message_type === 'Text' && <MarkdownRenderer content={block.data.text} />}
                    {(block.data.message_type === 'File' || block.data.message_type === 'Image') && <FileMessageBlock {...block.data} onFilePreviewModalOpen={onFilePreviewModalOpen} />}
                </ChatMessageBox>
            )
        }
        return null
    }

    return (
        <Box ref={boxRef} height='100%' className="overflow-y-scroll">
            <Virtuoso
                customScrollParent={boxRef.current ?? undefined}
                totalCount={parsedMessages.length}
                itemContent={index => renderItem(parsedMessages[index])}
                initialTopMostItemIndex={parsedMessages.length - 1}
                components={{
                    Header: () => <ChannelHistoryFirstMessage channelID={channelData?.name} />,
                }}
                ref={virtuosoRef}
                increaseViewportBy={300}
                alignToBottom={true}
                followOutput={'smooth'}
            />
            <FilePreviewModal
                isOpen={modalManager.modalType === ModalTypes.FilePreview}
                onClose={modalManager.closeModal}
                {...modalManager.modalContent}
            />
        </Box>
    )
}