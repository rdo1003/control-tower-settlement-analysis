//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { type ReactNode } from "react";

import { TONE_LABEL, type Tone } from "@/lib/settlement-format";

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    icon?: ReactNode;
    /** Conditional-formatting tone: tints the card and adds a text label. */
    tone?: Tone;
}

export function MetricCard({ title, value, subtitle, trend, icon, tone }: MetricCardProps) {
    const toneLabel = tone ? TONE_LABEL[tone] : "";

    return (
        <div className={tone ? `metric-card tone-${tone}` : "metric-card"}>
            <div className="metric-header">
                <span className="metric-title">{title}</span>
                {icon && <span className="metric-icon">{icon}</span>}
            </div>
            <div className="metric-value">{value}</div>
            {(subtitle || trend || toneLabel) && (
                <div className="metric-footer">
                    {toneLabel && <span className="tone-label">{toneLabel}</span>}
                    {trend && (
                        <span className={`metric-trend ${trend.isPositive ? "positive" : "negative"}`}>
                            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value).toFixed(1)}%
                        </span>
                    )}
                    {subtitle && <span className="metric-subtitle">{subtitle}</span>}
                </div>
            )}
        </div>
    );
}
