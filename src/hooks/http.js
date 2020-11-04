import { useReducer, useCallback } from "react";

const initialState = {
    loading: false,
    error: null,
    data: null,
    extra: null,
    identifier: null,
};

const httpReducer = (curHttpState, action) => {
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
    const [httpState, dispatchHttp] = useReducer(httpReducer, initialState);

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
                    console.log(extra)
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
        clear: clear
    };
};

export default useHttp;
