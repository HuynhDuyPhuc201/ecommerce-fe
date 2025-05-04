export const formattedDate = (isoDate) => {
    const date = new Date(isoDate);
    if (isNaN(date)) return 'Invalid date';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};
