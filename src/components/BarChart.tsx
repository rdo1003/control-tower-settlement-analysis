//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { Tone } from "@/lib/settlement-format";

interface BarChartProps {
    data: { label: string; value: number; tone?: Tone }[];
    title: string;
    formatValue?: (value: number) => string;
}

export function BarChart({ data, title, formatValue = (v) => v.toLocaleString() }: BarChartProps) {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="chart-card">
            <h3 className="chart-title">{title}</h3>
            <div className="bar-chart">
                {data.map((item, index) => (
                    <div key={index} className={item.tone ? `bar-row tone-${item.tone}` : "bar-row"}>
                        <span className="bar-label">{item.label}</span>
                        <div className="bar-container">
                            <div
                                className="bar-fill"
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                            />
                        </div>
                        <span className="bar-value">{formatValue(item.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
