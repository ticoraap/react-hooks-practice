import React, { useReducer, useCallback, useMemo, useEffect } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import Search from "./Search";
import useHttp from "../../hooks/http";

const ingredientReducer = (currentIngredients, action) => {
    switch (action.type) {
        case "SET":
            return action.ingredients;
        case "ADD":
            return [...currentIngredients, action.ingredient];
        case "DELETE":
            return currentIngredients.filter((ing) => ing.id !== action.id);
        default:
            throw new Error("Should not get there!" + action.type);
    }
};

const Ingredients = (props) => {
    const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
    const {
        isLoading,
        data,
        error,
        sendRequest,
        reqExtra,
        reqIdentifier,
        clear
    } = useHttp();

    useEffect(() => {
        console.log(`isLoading: ${isLoading}, !error: ${!error}, reqIdentifier: ${reqIdentifier} extra: ${reqExtra}`)
        if (!isLoading && reqIdentifier === "REMOVE_INGREDIENT") {
            dispatch({ type: "DELETE", id: reqExtra });
        } else if (!isLoading && !error && reqIdentifier === "ADD_INGREDIENT") {
            console.log('bang')
            console.log(data, reqExtra)
            dispatch({
                type: "ADD",
                ingredient: { id: data.name, ...reqExtra },
            });
        }
    }, [data, reqExtra, reqIdentifier, isLoading, error]);

    const filteredIngredientsHandler = useCallback((filteredIngredients) => {
        dispatch({ type: "SET", ingredients: filteredIngredients });
    }, []);

    const addIngredientHandler = useCallback(
        (ingredient) => {
            sendRequest(
                "https://react-ingredientlist.firebaseio.com/ingredients.json",
                "POST",
                ingredient,
                ingredient,
                "ADD_INGREDIENT"
            );
        },
        [sendRequest]
    );

    const removeIngredientHandler = useCallback(
        (id) => {
            sendRequest(
                `https://react-ingredientlist.firebaseio.com/ingredients/${id}.jon`,
                "DELETE",
                null,
                id,
                "REMOVE_INGREDIENT"
            );
        },
        [sendRequest]
    );

    const ingredientList = useMemo(() => {
        return (
            <IngredientList
                ingredients={userIngredients}
                onRemoveItem={removeIngredientHandler}
            />
        );
    }, [userIngredients, removeIngredientHandler]);

    return (
        <div className="App">
            {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
            <IngredientForm
                onAddIngredient={addIngredientHandler}
                loading={isLoading}
            />

            <section>
                <Search onLoadIngredients={filteredIngredientsHandler} />
                {ingredientList}
            </section>
        </div>
    );
};

export default Ingredients;