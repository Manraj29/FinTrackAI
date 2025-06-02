import React, { useRef, useEffect, useState } from 'react';
import { ArrowDownIcon, ClipboardIcon, DocumentIcon, DocumentMinusIcon, TvIcon, UserIcon } from '@heroicons/react/24/outline';

export default function ChatWindow({ messages = [], setMessages, isLoading, setIsLoading, chatNames, setChatName }) {
    const bottomRef = useRef(null);
    const [typedContent, setTypedContent] = useState('');
    const [typingIndex, setTypingIndex] = useState(null); // Track which message is being typed
    const [lastTypedId, setLastTypedId] = useState(null); // to track which msg was typed
    const [thinkingTimeoutId, setThinkingTimeoutId] = useState(null);


    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, typedContent]);

    // Typing animation effect
    useEffect(() => {
        if (!messages.length) return;

        const lastMsgIndex = messages.length - 1;
        const lastMsg = messages[lastMsgIndex];

        const isRecent =
            lastMsg.timestamp && Date.now() - new Date(lastMsg.timestamp).getTime() < 10000;

        // Timeout for thinking messages
        if (lastMsg.thinking) {
            const timeoutId = setTimeout(() => {
                setMessages(prevMessages => {
                    const updated = [...prevMessages];
                    updated[lastMsgIndex] = {
                        ...updated[lastMsgIndex],
                        thinking: false,
                        content: "An error occurred. Please try again.",
                    };
                    return updated;
                });
            }, 20000); // 20 seconds

            setThinkingTimeoutId(timeoutId);
            return () => clearTimeout(timeoutId);
        }

        // Typing animation (if it's assistant and not thinking)
        if (
            lastMsg.role === 'assistant' &&
            !lastMsg.thinking &&
            isRecent &&
            lastMsgIndex !== lastTypedId
        ) {
            setTypedContent(lastMsg.content.charAt(0));
            setTypingIndex(lastMsgIndex);
            setLastTypedId(lastMsgIndex);

            let i = 1;
            const interval = setInterval(() => {
                setTypedContent(prev => prev + lastMsg.content.charAt(i));
                i++;
                if (i >= lastMsg.content.length) {
                    clearInterval(interval);
                    setTypingIndex(null);
                }
            }, 20);

            return () => clearInterval(interval);
        }

        // Clear previous timeout if new message arrives
        return () => {
            if (thinkingTimeoutId) clearTimeout(thinkingTimeoutId);
        };
    }, [messages]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const formatInlineStyles = (text) => {
        const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|_(.*?)_)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.slice(lastIndex, match.index));
            }

            if (match[2]) parts.push(<strong key={match.index}>{match[2]}</strong>);
            else if (match[3]) parts.push(<em key={match.index}>{match[3]}</em>);
            else if (match[4]) parts.push(<em key={match.index}>{match[4]}</em>);

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex));
        }

        return parts;
    };

    const changeStyle = (text) => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const elements = [];
        let currentList = [];
        let listType = null;

        const flushList = () => {
            if (!currentList.length) return;

            const items = currentList.map((item, i) => <li key={i}>{formatInlineStyles(item)}</li>);
            elements.push(
                listType === 'ol'
                    ? <ol key={elements.length} className="list-decimal list-inside my-2 text-justify">{items}</ol>
                    : <ul key={elements.length} className="list-disc list-inside my-2 text-justify">{items}</ul>
            );

            currentList = [];
            listType = null;
        };

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            const unorderedMatch = /^\*\s+(.*)/.exec(trimmed);
            const orderedMatch = /^(\d+)\.\s+(.*)/.exec(trimmed);

            if (unorderedMatch) {
                if (listType !== 'ul') flushList();
                listType = 'ul';
                currentList.push(unorderedMatch[1]);
            } else if (orderedMatch) {
                if (listType !== 'ol') flushList();
                listType = 'ol';
                currentList.push(orderedMatch[2]);
            } else {
                flushList();
                elements.push(<p key={index} className="my-2 text-justify">{formatInlineStyles(trimmed)}</p>);
            }
        });

        flushList();
        return <div>{elements}</div>;
    };

    return (
        <div className="flex-1 overflow-y-auto p-7 bg-[#e0e0e0] lg:px-40">
            {messages.length === 0 && (
                <div className='text-center justify-center'>
                    <p className='text-2xl mb-4 lg:my-30 my-20'>
                        <span className='text-4xl text-amber-800 font-bold mb-3'>Welcome to FinTrackAI</span>,
                    </p>
                    <p className='text-xl font-light mb-5'>
                        We here help you to gain insights from your bank statements. <br />
                        This is a safe and secure platform.
                    </p>
                    <p>
                        <span className='text-2xl my-4 mt-10'>Send a message</span> <br />
                        to start a chat
                    </p>
                    <ArrowDownIcon className='w-10 h-10 m-auto mt-4' />
                    <p className='font-extralight mt-10'>
                        <span className='font-normal'>Note:</span> Please do not start with any sort of greeting, instead
                        <span className='font-medium'> start with your direct query</span>.
                    </p>
                </div>
            )}

            {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                let chatName = null;
                let contentToRender = msg.content;

                const isPDF = msg.fileType === 'pdf' || msg.file?.mimetype === 'application/pdf';

                if (!isUser && msg.content.includes("The name of this chat is")) {
                    const nameLineMatch = msg.content.match(/The name of this chat is (.+?)(\.|\n|$)/);
                    if (nameLineMatch) {
                        chatName = nameLineMatch[1].trim();
                        contentToRender = msg.content.replace(nameLineMatch[0], '').trim();
                    }
                    setChatName(chatName);
                }

                return (
                    <div key={index} className={`flex columns-2 text-sm lg:text-base gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        {!isUser && (
                            <div className='w-7 h-7 rounded-4xl flex mt-auto border-1 p-1 mb-4'>
                                <TvIcon />
                            </div>
                        )}
                        <div className="group relative mb-4 flex">
                            <div className={`max-w-xl p-5 rounded-lg relative ${isUser
                                ? 'bg-[#ebebeb] text-[#263238] rounded-br-none'
                                : 'bg-[#747b7f] text-gray-200 rounded-bl-none'}`}>
                                {isPDF && (
                                    <div>
                                        <div className="mt-3 border flex w-40 items-center rounded shadow mx-auto overflow-hidden mb-2" title='Sorry cant reopen the file'>
                                            <p className="text-xs py-3 m-auto mb-1 text-gray-500 mt-1">{msg.fileName}</p>
                                            <DocumentMinusIcon className='w-4 m-auto' />
                                        </div>
                                        <p className='text-xs text-center mb-2'>Note: If another pdf is shared, this one will be deleted.</p>
                                    </div>
                                )}
                                {msg.thinking ? (
                                    <div className="flex items-center gap-1">
                                        FinTrackAI is thinking
                                        <span className="animate-bounce">.</span>
                                        <span className="animate-bounce delay-100">.</span>
                                        <span className="animate-bounce delay-200">.</span>
                                    </div>
                                ) : (
                                    typingIndex === index && !isUser
                                        ? typedContent
                                        : (isUser ? msg.content : changeStyle(contentToRender))
                                )}

                                {!isUser && !msg.thinking && (
                                    <button
                                        onClick={() => copyToClipboard(contentToRender)}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-700 hover:text-black cursor-pointer"
                                        title="Copy"
                                    >
                                        <ClipboardIcon className="h-5 w-5" />
                                    </button>
                                )}
                            </div>

                            {isUser && (
                                <div className='w-7 h-7 ml-2 rounded-4xl flex mt-auto border p-1'>
                                    <UserIcon />
                                </div>
                            )}

                            <div ref={bottomRef} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
