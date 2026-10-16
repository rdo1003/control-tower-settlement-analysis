//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useEffect, useRef, useState, type FormEvent } from "react";

import { askDataAgent } from "../lib/data-agent";

interface ChatMessage {
    id: number;
    role: "user" | "agent" | "error";
    text: string;
}

const MAX_QUESTION_LENGTH = 2000;

const SUGGESTIONS = [
    "How many exceptions are there for each severity level?",
    "What are the top 3 root cause categories from investigations?",
    "How many exceptions breached their SLA versus not?",
];

export function DataAgentChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isAsking, setIsAsking] = useState(false);
    const nextId = useRef(1);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
    }, [messages, isAsking]);

    const append = (role: ChatMessage["role"], text: string) =>
        setMessages((prev) => [...prev, { id: nextId.current++, role, text }]);

    const ask = async (raw: string) => {
        const question = raw.trim();
        if (!question || isAsking) return;

        append("user", question);
        setInput("");
        setIsAsking(true);
        try {
            append("agent", await askDataAgent(question));
        } catch (err) {
            append("error", err instanceof Error ? err.message : "The data agent request failed.");
        } finally {
            setIsAsking(false);
        }
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        void ask(input);
    };

    return (
        <section className="agent-chat" aria-label="Ask the data agent">
            <h2 className="agent-chat-title">Ask the data agent</h2>
            <p className="agent-chat-subtitle">
                Ask questions about your data in plain language. Answers come from a published Fabric data agent.
            </p>

            <div className="agent-chat-log" role="log" aria-live="polite">
                {messages.length === 0 && (
                    <div className="agent-chat-suggestions">
                        {SUGGESTIONS.map((s) => (
                            <button
                                key={s}
                                type="button"
                                className="agent-chat-suggestion"
                                onClick={() => void ask(s)}
                                disabled={isAsking}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {messages.map((m) => (
                    <div key={m.id} className={`agent-chat-message ${m.role}`}>
                        {m.text}
                    </div>
                ))}

                {isAsking && <div className="agent-chat-message agent pending">Thinking…</div>}
                <div ref={endRef} />
            </div>

            <form className="agent-chat-form" onSubmit={onSubmit}>
                <input
                    className="agent-chat-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about your data"
                    maxLength={MAX_QUESTION_LENGTH}
                    disabled={isAsking}
                    aria-label="Question"
                />
                <button className="agent-chat-send" type="submit" disabled={isAsking || !input.trim()}>
                    Ask
                </button>
            </form>
        </section>
    );
}
