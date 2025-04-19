import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, Col, Row } from 'antd';
import { Tabs } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '~/services/admin.service';

const DashboardChart = () => {
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [weeklyRevenue, setWeeklyRevenue] = useState([]);

    const { data: dataMonth } = useQuery({
        queryKey: ['revenue', 'month', 2025],
        queryFn: async () => await adminService.getRevenueStatistics('month'),
        staleTime: 5 * 60 * 1000, // Dữ liệu sẽ không bị stale trong 5 phút
        cacheTime: 30 * 60 * 1000, // Dữ liệu sẽ bị xóa khỏi cache sau 30 phút
        retry: 0, // Không retry nếu lỗi
        refetchOnWindowFocus: false, // Tắt refetch khi tab focus lại
        refetchOnReconnect: false, // Tắt refetch khi mạng có lại
    });
    const { data: dataYear } = useQuery({
        queryKey: ['revenue', 'year', 2025],
        queryFn: async () => await adminService.getRevenueStatistics('week'),
        staleTime: 5 * 60 * 1000, // Dữ liệu sẽ không bị stale trong 5 phút
        cacheTime: 30 * 60 * 1000, // Dữ liệu sẽ bị xóa khỏi cache sau 30 phút
        retry: 0, // Không retry nếu lỗi
        refetchOnWindowFocus: false, // Tắt refetch khi tab focus lại
        refetchOnReconnect: false, // Tắt refetch khi mạng có lại
    });

    useEffect(() => {
        if (dataMonth) {
            setMonthlyRevenue(dataMonth.data);
        }
        if (dataYear) {
            setWeeklyRevenue(dataYear.data);
        }
    }, [dataMonth, dataYear]);

    const renderLineChart = (data) => (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip
                    formatter={(value, name) => {
                        if (name === 'totalRevenue') return [`${value.toLocaleString()} ₫`, 'Tổng tiền'];
                        if (name === 'totalOrders') return [value, 'Số đơn hàng'];
                        return [value, name];
                    }}
                />
                <Line type="monotone" dataKey="totalRevenue" stroke="#1890ff" strokeWidth={2} />
                <Line type="monotone" dataKey="totalOrders" stroke="#f56c6c" />
            </LineChart>
        </ResponsiveContainer>
    );

    const renderBarChart = (data) => (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip
                    formatter={(value, name) => {
                        if (name === 'totalRevenue') return [`${value.toLocaleString()} ₫`, 'Tổng tiền'];
                        if (name === 'totalOrders') return [value, 'Số đơn hàng'];
                        return [value, name];
                    }}
                />
                <Bar dataKey="totalRevenue" fill="#82ca9d" radius={[6, 6, 0, 0]} />
                <Bar dataKey="totalOrders" fill="#82ca9d" radius={[6, 6, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );

    return (
        <Card title="📊 Thống kê doanh thu" variant={false} style={{ width: '100%', borderRadius: 12 }}>
            <Tabs
                defaultActiveKey="month"
                items={[
                    {
                        label: 'Theo tháng',
                        key: 'month',
                        children: monthlyRevenue.length > 0 ? renderLineChart(monthlyRevenue) : 'Đang tải dữ liệu...',
                    },
                    {
                        label: 'Theo tuần',
                        key: 'week',
                        children: weeklyRevenue.length > 0 ? renderBarChart(weeklyRevenue) : 'Đang tải dữ liệu...',
                    },
                ]}
            />
        </Card>
    );
};

export default DashboardChart;
