export const getevent_typeColor = (type: string) => {
    const colors = {
        webinar: 'bg-blue-100 text-blue-800',
        workshop: 'bg-green-100 text-green-800',
        seminar: 'bg-purple-100 text-purple-800',
        admission: 'bg-orange-100 text-orange-800',
        exam: 'bg-red-100 text-red-800',
        joining: 'bg-cyan-100 text-cyan-800',
        other: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.other;
};