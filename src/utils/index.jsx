export const fetchData = async (query, signal) => {
    const response = await fetch(query, {signal});
    if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}



