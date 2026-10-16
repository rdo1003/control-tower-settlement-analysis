//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { Tone } from "@/lib/settlement-format";

interface ToneBadgeProps {
    tone: Tone;
    children: string;
}

/** Pill that carries its meaning in text, with the tone as reinforcement. */
export function ToneBadge({ tone, children }: ToneBadgeProps) {
    return <span className={`tone-badge tone-${tone}`}>{children}</span>;
}
