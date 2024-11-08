const login = (email: string, password: string) => {
    const url = 'http://localhost:3000/api/v1/login'

    const options: RequestInit = {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json"}
    }

    fetch(url, options)
        .then((response: Response) => {
            if (!response.ok) {
                throw new Error(`${response.status}`);
            }

            response.json().then((data) => {
                console.log(data);
            });
        })
        .catch((error: Error) => {
            console.warn(error);
        });
}

export { login }