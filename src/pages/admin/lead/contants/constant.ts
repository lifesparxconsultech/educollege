export const statuses = ['all', 'new', 'contacted', 'qualified', 'converted', 'lost'];

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'new': return 'bg-blue-100 text-blue-800';
        case 'contacted': return 'bg-yellow-100 text-yellow-800';
        case 'qualified': return 'bg-green-100 text-green-800';
        case 'converted': return 'bg-purple-100 text-purple-800';
        case 'lost': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
