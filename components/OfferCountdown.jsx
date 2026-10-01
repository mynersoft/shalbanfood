"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

export default function OfferCountdown({ endDate }) {
    const calculateTime = () => {
        const difference =
            new Date(endDate).getTime() -
            new Date().getTime();

        if (difference <= 0) {
            return {
                expired: true,
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
            };
        }

        return {
            expired: false,
            days: Math.floor(
                difference / (1000 * 60 * 60 * 24)
            ),
            hours: Math.floor(
                (difference / (1000 * 60 * 60)) % 24
            ),
            minutes: Math.floor(
                (difference / (1000 * 60)) % 60
            ),
            seconds: Math.floor(
                (difference / 1000) % 60
            ),
        };
    };

    const [time, setTime] =
        useState(calculateTime);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(calculateTime());
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate]);

    if (time.expired) {
        return (
            <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                <Clock3 size={16} />
                Offer expired
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Clock3 size={16} />

            <div className="flex gap-1 text-xs font-semibold">
                <span>
                    {String(time.days).padStart(2, "0")}d
                </span>

                <span>:</span>

                <span>
                    {String(time.hours).padStart(2, "0")}h
                </span>

                <span>:</span>

                <span>
                    {String(time.minutes).padStart(2, "0")}m
                </span>

                <span>:</span>

                <span>
                    {String(time.seconds).padStart(2, "0")}s
                </span>
            </div>
        </div>
    );
}