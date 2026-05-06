const formatDate = (val) => {
    if (!val) return '2000-01-01';
    
    // If it's a number (Excel serial date)
    if (typeof val === 'number') {
        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
        return date.toISOString().split('T')[0];
    }
    
    // If it's already a date string or object
    const date = new Date(val);
    if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
    }
    
    // Try manual parsing for DD-MM-YYYY or DD/MM/YYYY
    const str = String(val);
    const parts = str.split(/[-/]/);
    if (parts.length === 3) {
        // Assume DD-MM-YYYY
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2];
        if (y.length === 4) return `${y}-${m}-${d}`;
        if (y.length === 2) return `20${y}-${m}-${d}`;
    }
    
    return str; // Fallback
};

console.log('37756 ->', formatDate(37756));
console.log('"37756" ->', formatDate("37756"));
