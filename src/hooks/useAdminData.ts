import { useState, useEffect, useCallback } from 'react';
import { API_V1_URL } from '../config';

export const useAdminData = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [streamerRequests, setStreamerRequests] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    const fetchData = useCallback(() => {
        if (!token) return;
        setLoading(true);
        Promise.all([
            fetch(`${API_V1_URL}/applications/`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
            fetch(`${API_V1_URL}/streamer-requests/`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
            fetch(`${API_V1_URL}/tickets/`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json())
        ])
            .then(([appData, streamerData, ticketsData]) => {
                const sortByDate = (data: any[]) =>
                    Array.isArray(data)
                        ? data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        : [];

                setApplications(sortByDate(appData));
                setStreamerRequests(sortByDate(streamerData));
                setTickets(sortByDate(ticketsData));
            })
            .catch(err => console.error('Error fetching admin data:', err))
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateStatus = async (type: 'applications' | 'streamer-requests' | 'tickets', id: number, status: string) => {
        try {
            const res = await fetch(`${API_V1_URL}/${type}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchData();
            return res.ok;
        } catch (err) {
            console.error(`Error updating ${type} status:`, err);
            return false;
        }
    };

    const deleteItem = async (type: 'applications' | 'tickets', id: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) return false;
        try {
            const res = await fetch(`${API_V1_URL}/${type}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchData();
            return res.ok;
        } catch (err) {
            console.error(`Error deleting ${type}:`, err);
            return false;
        }
    };

    return {
        applications,
        streamerRequests,
        tickets,
        loading,
        refresh: fetchData,
        updateStatus,
        deleteItem
    };

};
