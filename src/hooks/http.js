import { useReducer, useCallback } from "react";

const initialState = {
    loading: false,
    error: null,
    data: null,
    extra: null,
    identifier: null,
};

// functionality 4.2 the reducer function
// first argument is the current state, the action defines the changes to be made
const httpReducer = (curHttpState, action) => {
    // switch statment on action.type to return a new or updated HttpState object
    switch (action.type) {
        case "SEND":
            return {
                loading: true,
                error: null,
                data: null,
                extra: null,
                identifier: action.identifier,
            };
        case "RESPONSE":
            return {
                ...curHttpState,
                loading: false,
                data: action.responseData,
                extra: action.extra,
            };
        case "ERROR":
            return { loading: false, error: action.errorMessage };
        case "CLEAR":
            return { ...curHttpState, error: null };
        default:
            throw new Error("Should not be reached!" + action.type);
    }
};

const useHttp = () => {
    // functionality 4.1 useReducer hook
    // return a state of the reducer and a method to use the reducer
    const [httpState, dispatchHttp] = useReducer(httpReducer, initialState);

    // functionality 4.3 useCallback
    // useCallBack returns a memoized 
    const clear = useCallback(() => dispatchHttp({ type: "CLEAR" }), []);

    const sendRequest = useCallback(
        (url, method, body, extra, reqIdentifier) => {
            dispatchHttp({ type: "SEND", identifier: reqIdentifier });
            fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(response.message);
                    }
                    return response.json();
                })
                .then((responseData) => {
                    dispatchHttp({
                        type: "RESPONSE",
                        responseData: responseData,
                        extra: extra,
                    });
                })
                .catch((error) => {
                    dispatchHttp({
                        type: "ERROR",
                        errorMessage: error.message,
                    });
                });
        },
        []
    );

    return {
        isLoading: httpState.loading,
        data: httpState.data,
        error: httpState.error,
        sendRequest: sendRequest,
        reqExtra: httpState.extra,
        reqIdentifier: httpState.identifier,
        clear: clear,
    };
};

export default useHttp;
