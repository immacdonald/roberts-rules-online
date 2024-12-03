const isFlagged = (flag: string | null, index: number): boolean => {
    if (!flag || index >= flag.length) {
        return false;
    }

    const properIndex = flag.length - index - 1;
    return flag[properIndex] === '1';
};

const setFlag = (flag: string, index: number, active: boolean): string => {
    const properIndex = flag.length - index - 1;
    let current = '';

    for (let i = 0; i < flag.length; i++) {
        if (i === properIndex) {
            current += active ? '1' : '0';
        } else {
            current += flag[i];
        }
    }

    console.log(`Set ${flag} to ${current}`);
    return current;
};

const invertFlag = (flag: string, index: number): string => {
    const properIndex = flag.length - index - 1;
    let current = '';

    for (let i = 0; i < flag.length; i++) {
        if (i === properIndex) {
            current += flag[i] === '0' ? '1' : '0';
        } else {
            current += flag[i];
        }
    }

    console.log(`Inverted ${flag} bit ${index} to ${current}`);
    return current;
};

export { isFlagged, setFlag, invertFlag };
