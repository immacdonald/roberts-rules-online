// Updates an id-based object in an array if it exists, other appends it
const addOrReplaceInArrayById = <T extends { id: string }>(array: T[], newItem: T): T[] => {
    const index = array.findIndex((item) => item.id == newItem.id);

    if (index !== -1) {
        const newArray = [...array];
        newArray[index] = newItem;
        return newArray;
    } else {
        return [...array, newItem];
    }
};

const capitalize = (str: string): string => {
    return str[0].toUpperCase() + str.slice(1);
};

const cleanTextForDatabase = (str: string): string => {
    return str
        .replace(/'/g, "''") // Escape single quotes
        .replace(/"/g, '""') // Escape double quotes (optional, depending on DB)
        .replace(/\[/g, '\\[') // Escape opening square brackets
        .replace(/\]/g, '\\]') // Escape closing square brackets
        .replace(/\?/g, '\\?'); // Escape question marks
};

export { addOrReplaceInArrayById, capitalize, cleanTextForDatabase };
