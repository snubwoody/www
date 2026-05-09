
export class RequestError extends Error{
    
    /** The response body of the request 
     * that caused the error. 
     * */
    response?: unknown;
    
    constructor(message: string,response?: unknown){
        super(message);
        this.response = response;
    }
}

export const createSubscriber = async(email: string) => {
    // eslint-disable-next-line no-undef
    const apiKey = import.meta.env.BUTTONDOWN_API_KEY ?? process.env.BUTTONDOWN_API_KEY;

    const response = await fetch("https://api.buttondown.com/v1/subscribers", {
        method: "POST",
        headers: {
            "Authorization": `Token ${apiKey}`
        },
        body: JSON.stringify({email_address: email})
    });
    
    const data: unknown = await response.json();
    if(!response.ok){
        console.error(data);
        throw new RequestError("Failed to subscribe",data);
    }
};
