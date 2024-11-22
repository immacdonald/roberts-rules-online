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

export { addOrReplaceInArrayById };
