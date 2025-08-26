
import { AreaSeries, createChart, ColorType } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

export const ChartComponent = props => {
    const {
        data,
    } = props;

    const chartContainerRef = useRef();

    useEffect(
        () => {
            const handleResize = () => {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            };

            const chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: getComputedStyle(document.documentElement).getPropertyValue('--color-bg-primary').trim() },
                    textColor: getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim(),
                },
                width: chartContainerRef.current.clientWidth,
                height: 300,
            });
            chart.timeScale().fitContent();

            const newSeries = chart.addSeries(AreaSeries, {
                 lineColor: getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim(),
                 topColor: getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim(),
                bottomColor: 'rgba(255, 175, 90, 0.2)',
                
                });
            newSeries.setData(data);

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);

                chart.remove();
            };
        },
        [data]
    );

    return (
        <div
            ref={chartContainerRef}
        />
    );
};

export default ChartComponent;
